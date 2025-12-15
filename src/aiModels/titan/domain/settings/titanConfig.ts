export type TitanConfig = {
  /** BedrockのモデルID */
  defaultModel: string;
  defaultMaxTokens: number;
  defaultTemperature: number;
  defaultTopP: number;
  defaultStopSequences: string[];
  /** デフォルトのAWSプロファイル（環境変数がない場合に使用） */
  defaultAwsProfile: string;
  defaultEmbeddingsModel: string;
};

export function loadTitanConfig(): TitanConfig {
  const config: TitanConfig = {
    defaultModel: "amazon.titan-text-express-v1",
    defaultMaxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9,
    defaultStopSequences: [],
    defaultAwsProfile: "default",
    defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
  };

  return config;
}
