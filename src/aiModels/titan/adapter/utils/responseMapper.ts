import { AiTextPayload } from "@core/contracts/aiModel/aiModelPayload";

/**
 * TitanのcompletionReasonをAiTextPayloadのfinishReasonにマッピング
 *
 * AWS Bedrock固有の値を共通インターフェースに変換する
 */
export function mapTitanCompletionReason(
  completionReason?: string,
): AiTextPayload["finishReason"] {
  switch (completionReason) {
    case "FINISH":
      return "stop"; // 正常終了
    case "MAX_TOKENS":
      return "length"; // トークン上限到達
    case "STOP_SEQUENCE":
      return "stop"; // 停止シーケンス検出（正常終了扱い）
    case "CONTENT_FILTER": // コンテンツフィルターによる停止（もしあれば）
      return "content-filter";
    default:
      return "unknown";
  }
}
