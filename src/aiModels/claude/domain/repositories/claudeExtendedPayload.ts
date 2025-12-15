/**
 * Claude拡張ペイロード
 * AiTextPayloadをClaudeのTool Use機能に対応させた拡張版
 */
import { AiTextPayload } from "@core/contracts/aiModel/aiModelPayload";
import { ClaudeToolUseRequestContent } from "./claudeRepositoryRequestPayload";
import { ClaudeMessageContent } from "./claudeRepositoryRequestPayload";

/**
 * Claude拡張メタデータ
 * Tool Use情報を含む生のレスポンスデータを保持
 */
export type ClaudeMetadata = {
  id: string;
  /** 生のcontentデータ（Tool Use情報を含む） */
  rawContent: (ClaudeMessageContent | ClaudeToolUseRequestContent)[];
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
 * 互換性維持
 *
 * TODO: ClaudeMetadataを使ってこれは削除する
 */
export type ClaudeExtendedMetadata = ClaudeMetadata;

/**
 * Claude拡張テキストペイロード
 * 通常のAiTextPayloadにClaudeのTool Use情報を追加
 */
export interface ClaudeTextPayload extends AiTextPayload {
  metadata: ClaudeMetadata;
}

/**
 * TODO: ClaudeTextPayloadを使ってこれは削除する
 */
export type ClaudeExtendedTextPayload = ClaudeTextPayload;

/**
 * Tool Useが含まれているかチェック（型ガード）
 */
export const hasToolUse = (
  payload: AiTextPayload | ClaudeTextPayload | ClaudeExtendedTextPayload,
): payload is ClaudeTextPayload => {
  const metadata = payload.metadata as ClaudeMetadata | undefined;
  return (
    metadata !== undefined &&
    "rawContent" in metadata &&
    Array.isArray(metadata.rawContent) &&
    metadata.rawContent.some((c) => c.type === "tool_use")
  );
};

/**
 * Tool Use情報を抽出
 */
export const extractToolUses = (
  payload: AiTextPayload | ClaudeTextPayload | ClaudeExtendedTextPayload,
): ClaudeToolUseRequestContent[] => {
  if (hasToolUse(payload)) {
    return extractToolUsesFromMetadata(payload.metadata);
  }
  return [];
};

/**
 * metadataからTool Use情報を抽出
 */
export const extractToolUsesFromMetadata = (
  metadata: ClaudeMetadata,
): ClaudeToolUseRequestContent[] => {
  return metadata.rawContent.filter(
    (c): c is ClaudeToolUseRequestContent => c.type === "tool_use",
  );
};
