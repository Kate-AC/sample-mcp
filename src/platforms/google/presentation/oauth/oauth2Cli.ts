#!/usr/bin/env node
import { OAuth2Client } from "google-auth-library";
import * as readline from "readline";
import { makeFileStorage } from "@infrastructure/shared/fileStorage";
import { loadGoogleConfig } from "../../domain/settings/googleConfig";
import { loadGoogleEnv } from "../../infrastructure/env/googleEnv";
import { makeGoogleOAuth2Client } from "../../infrastructure/http/googleApiClient";

/**
 * ユーザーからの入力を取得する
 */
const askQuestion = (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

/**
 * URLを自動で開く
 */
const openUrl = (url: string): void => {
  const { exec } = require("child_process");
  exec(`open "${url}"`, (error: any) => {
    if (error) {
      console.log(
        "ブラウザが自動で開かない場合は、上記のURLを手動でコピーしてブラウザに貼り付けてください。",
      );
    }
  });
};

/**
 * Google OAuth認証を実行するCLIコマンド
 */
const main = async (): Promise<void> => {
  try {
    const config = loadGoogleConfig();

    console.log("Google OAuth認証を開始します...\n");

    // GOOGLE_TOKEN_JSONが設定されている場合は既存のトークンを確認
    if (process.env["GOOGLE_TOKEN_JSON"]) {
      try {
        const env = loadGoogleEnv();
        const client = await makeGoogleOAuth2Client({
          config,
          env,
          fileStorage: makeFileStorage(),
        });
        console.log("✅ 既に認証済みです！");

        // 認証が成功したことを確認するため、簡単なAPI呼び出しをテスト
        try {
          const { google } = require("googleapis");
          const drive = google.drive({ version: "v3", auth: client });
          const response = await drive.files.list({ pageSize: 1 });
          console.log(
            `📁 アクセス可能なファイル数: ${response.data.files?.length || 0}`,
          );
        } catch (error) {
          console.log(
            "⚠️  APIテストでエラーが発生しましたが、認証は成功しています。",
          );
        }

        return;
      } catch (error: any) {
        console.log(`⚠️  既存のトークンが無効です: ${error.message}`);
        console.log("新しいトークンを取得します...\n");
      }
    }

    // GOOGLE_CREDENTIALS_JSONから認証情報を取得
    const credentialsJson = process.env["GOOGLE_CREDENTIALS_JSON"];
    if (!credentialsJson) {
      throw new Error(
        "GOOGLE_CREDENTIALS_JSON環境変数を設定してください。\n" +
          "Google Cloud Consoleで作成したcredentials.jsonの内容を設定します。",
      );
    }

    const credentials = JSON.parse(credentialsJson);
    const clientId = credentials.installed?.client_id;
    const clientSecret = credentials.installed?.client_secret;

    if (!clientId || !clientSecret) {
      throw new Error("credentials.jsonの形式が正しくありません");
    }

    // 認証URLを生成
    console.log("Googleアカウントでの認証が必要です。");
    console.log("以下のURLにアクセスして認証してください:");

    const client = new OAuth2Client(clientId, clientSecret, config.redirectUri);
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: config.scopes,
      prompt: "consent",
    });
    console.log("\n" + authUrl + "\n");

    // URLを自動で開く
    openUrl(authUrl);

    console.log("認証後、表示されるコードをコピーして入力してください。");
    console.log("（コードは通常、URLの「code=」の後に表示されます）");

    const code = await askQuestion("\n認証コードを入力してください: ");

    // 認証コードをトークンに交換
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    console.log("\n✅ 認証が完了しました！");
    console.log(
      "🔄 アクセストークンはファイルにキャッシュされ、自動更新されます",
    );
    console.log(
      "💡 リフレッシュトークンは.envのGOOGLE_TOKEN_JSONから取得されます",
    );
    console.log(
      "\n💾 取得したトークン情報を.envのGOOGLE_TOKEN_JSONに設定してください:",
    );
    console.log(`   GOOGLE_TOKEN_JSON='${JSON.stringify(tokens)}'`);

    console.log("\nこれでGoogle Docsの内容を取得できるようになりました。");

    // 認証が成功したことを確認するため、簡単なAPI呼び出しをテスト
    try {
      const { google } = require("googleapis");
      const drive = google.drive({ version: "v3", auth: client });
      await drive.files.list({ pageSize: 1 });
    } catch (error) {
      console.log(
        "⚠️  APIテストでエラーが発生しましたが、認証は成功しています。",
      );
    }
  } catch (error: any) {
    console.error("\n❌ 認証に失敗しました:", error.message);
    process.exit(1);
  }
};

// スクリプトが直接実行された場合のみmain()を呼び出し
if (require.main === module) {
  main();
}
