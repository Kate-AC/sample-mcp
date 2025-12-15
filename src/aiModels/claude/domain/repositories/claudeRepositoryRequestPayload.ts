// TODO: entities配下に移動したい

/**
 * Claude リクエスト用のペイロード定義
 */
export type ClaudeMessageContent = {
  type: "text";
  text: string;
};

/**
 * Claudeからのツール実行要求（リクエストでも使用）
 */
export type ClaudeToolUseRequestContent = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, any>;
};

/**
 * ツール実行結果に含める画像コンテンツ
 */
export type ClaudeImageContent = {
  type: "image";
  source: {
    type: "base64";
    media_type: string;
    data: string;
  };
};

/**
 * ツール実行結果をClaudeに返す
 * ツールを実行した結果をClaudeに伝える際に使用
 */
export type ClaudeToolUseResultContent = {
  type: "tool_result";
  tool_use_id: string;
  content: string | Array<{ type: "text"; text: string } | ClaudeImageContent>;
};

/**
 * Claude APIで使用可能なコンテンツ型
 */
export type ClaudeContentBlock =
  | ClaudeMessageContent
  | ClaudeImageContent
  | ClaudeToolUseRequestContent
  | ClaudeToolUseResultContent;

export type ClaudeMessage<T = ClaudeContentBlock[]> = {
  role: "user" | "assistant";
  content: string | T;
};

/**
 * Prompt Caching制御
 * キャッシュブレークポイントを指定するための定義
 */
export type ClaudeCacheControl = {
  type: "ephemeral";
};

/**
 * ToolUseスキーマ定義
 * Claudeに使用可能なツールを事前に伝えるための定義
 */
export type ClaudeToolUseSchema = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  cache_control?: ClaudeCacheControl;
};

/**
 * System promptのコンテンツブロック（cache_control対応）
 */
export type ClaudeSystemContentBlock = {
  type: "text";
  text: string;
  cache_control?: ClaudeCacheControl;
};

export type ClaudeRequest = {
  anthropic_version: string;
  max_tokens: number;
  messages: Array<{
    role: "user" | "assistant";
    content: string | ClaudeContentBlock[];
  }>;
  system?: string | ClaudeSystemContentBlock[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  tools?: ClaudeToolUseSchema[];
};
