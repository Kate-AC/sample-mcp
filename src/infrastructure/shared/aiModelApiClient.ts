import {
  BedrockRuntimeClient,
  BedrockRuntimeClientConfig,
} from "@aws-sdk/client-bedrock-runtime";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { AiModelEnv, loadAiModelEnv } from "./aiModelEnv";

/**
 * AIモデル用のBedrock Runtime Clientを作成
 * 認証設定とクライアント初期化のみを担当
 *
 * Claude、Titan、その他AWS Bedrockを使用するAIモデルで共通利用される
 */
export const makeAiModelApiClient = (
  env: AiModelEnv = loadAiModelEnv(),
): BedrockRuntimeClient => {
  // Bedrock Runtime Client設定
  const clientConfig: BedrockRuntimeClientConfig = {
    region: env.awsRegion,
  };

  // 認証情報設定の優先順位
  // 1. Bedrock Bearer Token（最優先）
  // 2. 明示的なクレデンシャル
  // 3. AWSプロファイル/IAMロール
  if (env.awsBearerTokenBedrock) {
    // Bearer Token認証
    // Bedrock APIキーはAccessKeyIdとして使用し、SecretAccessKeyは空文字列
    clientConfig.credentials = {
      accessKeyId: env.awsBearerTokenBedrock,
      secretAccessKey: "unused",
    };
  } else if (env.awsAccessKeyId && env.awsSecretAccessKey) {
    // 通常のIAMユーザー認証
    clientConfig.credentials = {
      accessKeyId: env.awsAccessKeyId,
      secretAccessKey: env.awsSecretAccessKey,
    };
  } else {
    // プロファイル/IAMロール認証
    clientConfig.credentials = fromNodeProviderChain({
      profile: env.awsProfile,
    });
  }

  return new BedrockRuntimeClient(clientConfig);
};
