/**
 * Claude拡張ペイロード
 * AiTextPayloadをClaudeのTool Use機能に対応させた拡張版
 */
import { AiTextPayload } from "@core/contracts/aiModel/aiModelPayload";

type ClaudeMessageContent = {
  type: "text";
  text: string;
};

type ClaudeToolUseContent = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, any>;
};

/**
 * Claude拡張メタデータ
 * Tool Use情報を含む生のレスポンスデータを保持
 */
export type ClaudeExtendedMetadata = {
  id: string;
  /** 生のcontentデータ（Tool Use情報を含む） */
  rawContent: (ClaudeMessageContent | ClaudeToolUseContent)[];
  /** Claudeの生のstop_reason */
  stopReason:
    | "end_turn"
    | "max_tokens"
    | "stop_sequence"
    | "tool_use"
    | "content_filter"
    | null;
  stopSequence?: string | null;
};

/**
 * Claude拡張テキストペイロード
 * 通常のAiTextPayloadにClaudeのTool Use情報を追加
 */
export interface ClaudeExtendedTextPayload extends AiTextPayload {
  metadata: ClaudeExtendedMetadata;
}

/**
 * Tool Useが含まれているかチェック
 */
export function hasToolUse(
  payload: AiTextPayload,
): payload is ClaudeExtendedTextPayload {
  const metadata = payload.metadata as ClaudeExtendedMetadata | undefined;
  return (
    metadata !== undefined &&
    "rawContent" in metadata &&
    Array.isArray(metadata.rawContent) &&
    metadata.rawContent.some((c) => c.type === "tool_use")
  );
}

/**
 * Tool Use情報を抽出
 */
export function extractToolUses(
  payload: ClaudeExtendedTextPayload,
): ClaudeToolUseContent[] {
  return payload.metadata.rawContent.filter(
    (c): c is ClaudeToolUseContent => c.type === "tool_use",
  );
}
