/**
 * Vercel AI SDKのgenerateTextペイロードをラップした型
 */
export interface AiTextPayload<T = any> {
  text: string;
  finishReason:
    | "stop"
    | "length"
    | "content-filter"
    | "tool-calls"
    | "error"
    | "other"
    | "unknown";
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  metadata?: {
    id?: string;
    headers?: Record<string, string>;
  };
  rawResponse?: {
    headers?: Record<string, string>;
  };
  // 元のレスポンス（Vercel AI SDKのgenerateText結果全体）
  _raw?: T;
}

/**
 * AI専用のクライアントポート（Vercel AI SDKベース）
 */
export interface AiClientPort {
  /**
   * テキスト生成
   * @param prompt プロンプト
   * @param options オプション（max_tokens, temperatureなど）
   */
  generateText: (
    prompt: string,
    options?: {
      max_tokens?: number;
      temperature?: number;
      system?: string;
    },
  ) => Promise<AiTextPayload>;
}
