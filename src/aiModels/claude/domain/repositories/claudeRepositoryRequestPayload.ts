/**
 * Claude リクエスト用のペイロード定義
 */

type ClaudeMessageContent = {
  type: "text";
  text: string;
};

/**
 * Claudeからのツール実行要求（リクエストでも使用）
 */
type ClaudeToolUseContent = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, any>;
};

/**
 * ツール実行結果をClaudeに返す
 * ツールを実行した結果をClaudeに伝える際に使用
 */
type ClaudeToolResultContent = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};

/**
 * Claude APIで使用可能なコンテンツ型
 */
export type ClaudeContentBlock =
  | ClaudeMessageContent
  | ClaudeToolUseContent
  | ClaudeToolResultContent;

export type ClaudeMessage = {
  role: "user" | "assistant";
  content: string | ClaudeContentBlock[];
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
};

export type ClaudeRequest = {
  anthropic_version: string;
  max_tokens: number;
  messages: Array<{
    role: "user" | "assistant";
    content: string | ClaudeContentBlock[];
  }>;
  system?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  tools?: ClaudeToolUseSchema[];
};
