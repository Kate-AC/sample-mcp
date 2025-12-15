/**
 * Claude レスポンス用のペイロード定義
 */

type ClaudeMessageContent = {
  type: "text";
  text: string;
};

/**
 * Claudeからのツール実行要求
 * Claudeが「このツールを実行してください」と要求する際に使用
 */
type ClaudeToolUseContent = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, any>;
};

export type ClaudeCreateMessagePayload = {
  id: string;
  type: "message";
  role: "assistant";
  content: (ClaudeMessageContent | ClaudeToolUseContent)[];
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use" | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};

/**
 * ClaudeのJSON形式レスポンスのペイロード
 * 分析結果と追加で必要な情報を構造化して返す
 */
export type ClaudeJsonPayload = {
  answer: string;
  additional_links: string[];
  additional_commands: string[];
  additional_infos: string[];
};

export type ClaudeResponse = {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<{
    type: "text";
    text: string;
  }>;
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "content_filter";
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};
