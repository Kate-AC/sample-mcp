import {
  ClaudeMessage,
  ClaudeToolUseRequestContent,
  ClaudeToolUseResultContent,
} from "../repositories/claudeRepositoryRequestPayload";

/**
 * ClaudeでToolUseのデータを返すためのデータセット
 */
export type ToolUseDataSet = {
  toolUseRequest: ClaudeMessage<ClaudeToolUseRequestContent[]>;
  toolUseResult: ClaudeMessage<ClaudeToolUseResultContent[]>;
};
