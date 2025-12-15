/**
 * AI共通のテキスト生成ペイロード
 */
export interface AiTextPayload {
  /** 生成されたテキスト */
  text: string;

  /** 終了理由 */
  finishReason:
    | "stop"
    | "length"
    | "content-filter"
    | "tool-calls"
    | "error"
    | "other"
    | "unknown";

  /** トークン使用量 */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /** 使用したモデル（オプション） */
  model?: string;

  /** レスポンスメタデータ（オプション） */
  metadata?: {
    id?: string;
    headers?: Record<string, string>;
  };
}

/**
 * JSON形式ペイロード（Claude askJson用）
 * 構造化されたデータを返す場合に使用
 */
export type AiJsonPayload = {
  answer: string;
  additional_links: string[];
  additional_commands: string[];
  additional_infos: string[];
};

/**
 * AI生成オプション
 */
export type AiGenerateOptions = {
  max_tokens?: number;
  temperature?: number;
  model?: string;
  system?: string;
};
