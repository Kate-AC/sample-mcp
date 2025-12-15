import {
  PlatformName,
  getAllMcp,
  getAllMcpNames,
} from "../../core/mcpRegistry";
import { call } from "../mcpHandler";
import {
  formatToPlainText,
  printMultipleToConsole,
  printToConsole,
} from "../utils/mcpMetadataFormatter";

/**
 * プラットフォームコマンドの定義
 */
export type Command = {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<void>;
};

/**
 * 各MCPのメタデータからコマンドを動的に生成
 */
const createPlatformCommands = (): Command[] => {
  const mcps = getAllMcp();
  const platformNames = getAllMcpNames();
  const commands: Command[] = [];

  mcps.forEach((mcp, index) => {
    const platformName = platformNames[index];
    if (!platformName) return; // 型安全性のためのガード

    const mcpCommands = mcp.mcpMetadata.getCommands();

    mcpCommands.forEach((cmd) => {
      // コマンド名から引数部分を除去（最初の単語だけを使用）
      const commandName = cmd.command.split(" ")[0];
      if (!commandName) return; // 型安全性のためのガード

      commands.push({
        name: `${platformName}:${commandName}`,
        description: `[${platformName}] ${cmd.description}`,
        execute: async (args: string[]) => {
          const isJsonOutput = process.env["JSON_OUTPUT"] === "true";

          if (!isJsonOutput) {
            console.log(`\n実行中: ${platformName}:${commandName}`);
            console.log(`引数: ${args.join(", ") || "(なし)"}\n`);
          }

          try {
            // その他の場合は通常の処理
            const response = await call({
              platform: platformName as PlatformName,
              funcName: commandName,
              args,
            });

            if (isJsonOutput) {
              // JSON形式で出力（E2Eテスト用）
              console.log(JSON.stringify(response));
            } else {
              // 人間向け形式で出力
              if (response.result.isSuccess) {
                console.log("✅ 成功\n");
                console.log(JSON.stringify(response.result.payload, null, 2));
              } else {
                console.error("❌ エラー");
                console.error(response.result.message);
              }
            }
          } catch (error) {
            if (isJsonOutput) {
              // JSON形式でエラー出力
              console.log(
                JSON.stringify({
                  platform: platformName,
                  funcName: commandName,
                  result: {
                    isSuccess: false,
                    message:
                      error instanceof Error ? error.message : String(error),
                    payload: null,
                  },
                }),
              );
            } else {
              console.error("❌ 実行失敗:");
              console.error(error);
            }
          }
        },
      });
    });
  });

  return commands;
};

export const platformCommands: Command[] = createPlatformCommands();

/**
 * コマンド名からコマンドを検索
 */
export const findCommand = (name: string): Command | undefined => {
  return platformCommands.find((cmd) => cmd.name === name);
};

/**
 * ヘルプメッセージを表示
 */
export const showHelp = (): void => {
  console.log("使用方法:");
  console.log(
    "  npm run cli help [platform]  - プラットフォームのコマンド一覧を表示",
  );
  console.log("  npm run cli [command] [args] - コマンドを実行");
  console.log("");
  console.log("利用可能なプラットフォーム:");
  const platformNames = getAllMcpNames();
  platformNames.forEach((name) => {
    console.log(`  ${name}`);
  });
  console.log("");
  console.log("例:");
  console.log("  npm run cli help faq");
  console.log("  npm run cli help github");
  console.log('  npm run cli faq:search "配送"');
  console.log("");
  console.log("初期設定:");
  console.log(
    "  npm run oauth:google      - Google OAuth認証の初期設定（初回のみ必要）",
  );
  console.log("");
  console.log("特別なコマンド:");
  console.log(
    "  all-commands              - 全プラットフォームのコマンド一覧を表示",
  );
  console.log("  show-markdown [platform]  - メタデータをMarkdown形式で表示");
  console.log(
    "  show-tool-schema          - Claude Tool Useスキーマを表示（JSON形式）",
  );
  console.log("  help, --help, -h          - このヘルプを表示");
  console.log("");
  console.log("テスト:");
  console.log("  npm test                  - ユニットテストを実行");
  console.log(
    "  RUN_E2E_TESTS=true npm test -- --testPathPatterns=e2e - E2Eテストを実行",
  );
};

/**
 * プラットフォーム別のコマンド一覧を表示
 */
export const showPlatformHelp = (platformName: string): void => {
  const mcps = getAllMcp();
  const platformNames = getAllMcpNames();
  const platformIndex = platformNames.findIndex(
    (name) => name === platformName,
  );

  if (platformIndex === -1 || !mcps[platformIndex]) {
    console.error(`プラットフォーム '${platformName}' が見つかりません`);
    console.error("\n利用可能なプラットフォーム:");
    platformNames.forEach((name) => {
      console.error(`  ${name}`);
    });
    return;
  }

  const mcp = mcps[platformIndex];
  const plainText = formatToPlainText(mcp.mcpMetadata, platformName);

  console.log(plainText);
};

/**
 * 全プラットフォームのコマンド一覧を表示
 */
export const showAllPlatformCommands = (): void => {
  const mcps = getAllMcp();
  const platformNames = getAllMcpNames();

  console.log("# 全プラットフォームのコマンド一覧");
  console.log("");

  mcps.forEach((mcp, index) => {
    const platformName = platformNames[index];
    if (!platformName) return;

    const plainText = formatToPlainText(mcp.mcpMetadata, platformName);
    console.log(plainText);
    console.log("");
    console.log("---");
    console.log("");
  });
};

/**
 * 全コマンドを取得（テスト用にexport）
 */
export const getAllPlatformCommands = (): Command[] => {
  return platformCommands;
};

/**
 * Markdown表示コマンド
 */
export const showMarkdownCommand = async (args: string[]): Promise<void> => {
  const platformFilter = args[0];

  try {
    const mcps = getAllMcp();
    const platformNames = getAllMcpNames();

    if (platformFilter) {
      // 特定のプラットフォームのみ
      const platformIndex = platformNames.findIndex(
        (name) => name === platformFilter,
      );
      if (platformIndex === -1 || !mcps[platformIndex]) {
        console.error(`プラットフォーム '${platformFilter}' が見つかりません`);
        console.error("利用可能なプラットフォーム:");
        platformNames.forEach((name) => {
          console.error(`  ${name}`);
        });
        return;
      }

      const mcp = mcps[platformIndex];
      printToConsole(mcp.mcpMetadata, platformFilter);
    } else {
      // 全てのプラットフォーム
      const metadataList = mcps.map((mcp, index) => ({
        metadata: mcp.mcpMetadata,
        platformName: platformNames[index] || `platform-${index + 1}`,
      }));

      printMultipleToConsole(metadataList);
    }
  } catch (error) {
    console.error("Markdown表示中にエラーが発生しました:", error);
  }
};
