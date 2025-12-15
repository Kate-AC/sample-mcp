export type ClaudeConfig = {
  /** BedrockのモデルID */
  defaultModel: string;
  /** デフォルトのmax_tokens */
  defaultMaxTokens: number;
  /** Anthropic version (Bedrock用) */
  defaultVersion: string;
  /** デフォルトのAWSプロファイル（環境変数がない場合に使用） */
  defaultAwsProfile: string;
};

export function loadClaudeConfig(): ClaudeConfig {
  const config: ClaudeConfig = {
    defaultModel: "jp.anthropic.claude-haiku-4-5-20251001-v1:0",
    defaultMaxTokens: 4096,
    defaultVersion: "bedrock-2023-05-31",
    defaultAwsProfile: "default",
  };

  return config;
}
