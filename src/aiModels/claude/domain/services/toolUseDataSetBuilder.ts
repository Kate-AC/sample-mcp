import { ImageObject } from "@core/contracts/object/imageObject";
import { ToolUseDataSet } from "../entities/toolUseDataSet";
import {
  ClaudeMessage,
  ClaudeToolUseRequestContent,
  ClaudeToolUseResultContent,
} from "../repositories/claudeRepositoryRequestPayload";

/**
 * tool_useとtool_resultのペアのデータセットを作成する
 *
 * NOTE: tool_useとtool_resultは常にペアで管理しないとAPIエラーとなる
 */
export const buildClaudeToolUseDataSet = (
  toolUseRequests: ClaudeToolUseRequestContent[],
  toolResults: ClaudeToolUseResultContent[],
): ToolUseDataSet | null => {
  if (toolUseRequests.length === 0 && toolResults.length === 0) {
    return null;
  }

  // ペアの整合性をチェック
  validateToolUsePair(toolUseRequests, toolResults);

  // toolUseRequest: assistantロールでtool_useを送信
  const toolUseRequest: ClaudeMessage<ClaudeToolUseRequestContent[]> = {
    role: "assistant",
    content: toolUseRequests,
  };

  // toolUseResult: userロールでtool_resultを送信
  const toolUseResult: ClaudeMessage<ClaudeToolUseResultContent[]> = {
    role: "user",
    content: toolResults,
  };

  return {
    toolUseRequest,
    toolUseResult,
  };
};

/**
 * ClaudeToolUseResultContentのcontentが画像データ（JSON文字列）の場合、
 * Claude APIの画像ブロック形式に変換する
 *
 * bulkToolUseRequestsExecutorが返すcontentはJSON.stringifyされた文字列なので、
 * それをパースして画像判定し、画像なら画像ブロックに変換する
 */
export const convertToolUseResultForImages = (
  result: ClaudeToolUseResultContent,
): ClaudeToolUseResultContent => {
  if (typeof result.content !== "string") {
    return result;
  }

  try {
    const parsed: unknown = JSON.parse(result.content);
    if (isImagePayload(parsed)) {
      return {
        type: "tool_result",
        tool_use_id: result.tool_use_id,
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: parsed.mimeType,
              data: parsed.base64,
            },
          },
        ],
      };
    }
  } catch {
    // JSONパースに失敗した場合はそのまま返す
  }

  return result;
};

/**
 * payloadがImageObject互換かどうかを判定する
 */
const isImagePayload = (payload: unknown): payload is ImageObject => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "base64" in payload &&
    "mimeType" in payload &&
    typeof (payload as ImageObject).base64 === "string" &&
    typeof (payload as ImageObject).mimeType === "string"
  );
};

/**
 * tool_useとtool_resultのペアの整合性をチェック
 */
const validateToolUsePair = (
  toolUses: ClaudeToolUseRequestContent[],
  toolResults: ClaudeToolUseResultContent[],
): void => {
  const toolUseIds = new Set(toolUses.map((tu) => tu.id));
  const toolResultIds = new Set(toolResults.map((tr) => tr.tool_use_id));

  // tool_useに対応するtool_resultが存在するかチェック
  const missingResults = Array.from(toolUseIds).filter(
    (id) => !toolResultIds.has(id),
  );
  if (missingResults.length > 0) {
    throw new Error(
      `tool_useに対応するtool_resultが不足しています: ${missingResults.join(", ")}`,
    );
  }

  // tool_resultに対応するtool_useが存在するかチェック
  const missingUses = Array.from(toolResultIds).filter(
    (id) => !toolUseIds.has(id),
  );
  if (missingUses.length > 0) {
    throw new Error(
      `tool_resultに対応するtool_useが不足しています: ${missingUses.join(", ")}`,
    );
  }
};
