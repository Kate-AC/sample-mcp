// MCP Registry
export * from "./core/mcpRegistry";

// AI Model Registry
export * from "./core/aiModelRegistry";

// Core types
export type { Mcp } from "./core/contracts/mcp/mcp";
export type { McpFunction } from "./core/contracts/mcp/mcpFunction";
export type { McpMetadata } from "./core/contracts/mcp/mcpMetadata";
export type { McpSetting } from "./core/contracts/mcp/mcpSetting";
export type { AiModel } from "./core/contracts/aiModel/aiModel";
export type { AiModelFunction } from "./core/contracts/aiModel/aiMocelFunction";
export type { AiModelMetadata } from "./core/contracts/aiModel/aiModelMetadata";
export type { AiModelSetting } from "./core/contracts/aiModel/aiModelSetting";
export type {
  AiTextPayload,
  AiJsonPayload,
} from "./core/contracts/aiModel/aiModelPayload";

// Result types
export type { Result, ResultFs } from "./core/result/result";

export type { RedmineIssuePayload } from "./platforms/redmine/domain/repositories/redmineRepositoryPayload";
export type {
  SlackMessagePayload,
  SlackConversationHistoryPayload,
  SlackPostMessagePayload,
  SlackSearchMessagesPayload,
} from "./platforms/slack/domain/repositories/slackRepositoryPayload";

// AI Model payload types (Request)
export type {
  ClaudeMessage,
  ClaudeToolUseSchema,
  ClaudeContentBlock,
} from "./aiModels/claude/domain/repositories/claudeRepositoryRequestPayload";

// AI Model payload types (Response)
export type {
  ClaudeJsonPayload,
  ClaudeCreateMessagePayload,
} from "./aiModels/claude/domain/repositories/claudeRepositoryResponsePayload";

// Claude拡張ペイロード
export type {
  ClaudeExtendedTextPayload,
  ClaudeExtendedMetadata,
} from "./aiModels/claude/domain/repositories/claudeExtendedPayload";
export {
  hasToolUse,
  extractToolUses,
} from "./aiModels/claude/domain/repositories/claudeExtendedPayload";

// AI Model types
export type { ClaudeAiModel } from "./core/aiModelRegistry";

// AI Model utilities
export { buildToolUseSchema } from "./aiModels/claude/adapter/utils/buildToolUseSchema";
