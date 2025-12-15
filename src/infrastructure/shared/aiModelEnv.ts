/**
 * AIモデル共通の環境変数型
 * AWS Bedrockを使用するAIモデル（Claude、Titanなど）で共通利用
 */
export type AiModelEnv = {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  awsProfile: string;
  awsBearerTokenBedrock: string;
};

/**
 * AIモデル共通の環境変数を読み込む
 *
 * @param defaultProfile デフォルトのAWSプロファイル名
 * @returns AIモデル環境変数
 */
export function loadAiModelEnv(): AiModelEnv {
  // getEnvを使わず直接process.envから取得（未定義を許容）
  const awsAccessKeyId = process.env["AWS_ACCESS_KEY_ID"] || "";
  const awsSecretAccessKey = process.env["AWS_SECRET_ACCESS_KEY"] || "";
  const awsRegion = process.env["AWS_REGION"] || "ap-northeast-1";
  const awsProfile = process.env["AWS_PROFILE"] || "dev-admin";
  const awsBearerTokenBedrock = process.env["AWS_BEARER_TOKEN_BEDROCK"] || "";

  const env: AiModelEnv = {
    awsAccessKeyId,
    awsSecretAccessKey,
    awsRegion,
    awsProfile,
    awsBearerTokenBedrock,
  };

  // 認証方法の優先順位チェック
  // 1. Bedrock Bearer Token
  // 2. 明示的なクレデンシャル（Access Key + Secret Key）
  // 3. AWSプロファイル
  const hasBearerToken = !!awsBearerTokenBedrock;
  const hasExplicitCredentials = awsAccessKeyId && awsSecretAccessKey;
  const hasAwsProfile = !!awsProfile;

  if (!hasBearerToken && !hasExplicitCredentials && !hasAwsProfile) {
    throw new Error(
      "AWS credentials are required. Set AWS_BEARER_TOKEN_BEDROCK, or AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or use AWS_PROFILE.",
    );
  }

  return env;
}
