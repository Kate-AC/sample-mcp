import { AiTextPayload } from "@core/contracts/aiModel/aiModelPayload";

/**
 * Claudeのstop_reasonをAiTextPayloadのfinishReasonにマッピング
 *
 * Anthropic Claude固有の値を共通インターフェースに変換する
 */
export function mapClaudeStopReason(
  stopReason: string,
): AiTextPayload["finishReason"] {
  switch (stopReason) {
    case "end_turn":
      return "stop"; // 正常終了
    case "max_tokens":
      return "length"; // トークン上限到達
    case "stop_sequence":
      return "stop"; // 停止シーケンス検出（正常終了扱い）
    case "tool_use":
      return "tool-calls"; // ツール使用
    case "content_filter":
      return "content-filter"; // コンテンツフィルター
    default:
      return "unknown";
  }
}
