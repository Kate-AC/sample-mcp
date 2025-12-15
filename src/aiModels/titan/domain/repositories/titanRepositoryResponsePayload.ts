/**
 * Titan レスポンス用のペイロード定義
 */

export type TitanResponse = {
  results: Array<{
    outputText: string;
    completionReason: "FINISH" | "MAX_TOKENS" | "STOP_SEQUENCE";
    inputTokenCount: number;
    outputTokenCount: number;
  }>;
};

export type TitanEmbeddingsResponse = {
  embedding: number[];
  inputTextTokenCount: number;
};
