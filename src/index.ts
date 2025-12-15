// MCP Registry
export * from "./core/mcpRegistry";

// Core services
export {
  makeUsageContextBuilder,
  type UsageContextBuilder,
} from "./core/services/usageContextBuilder";
export {
  makeSecurityRuleBuilder,
  type SecurityRuleBuilder,
} from "./core/services/securityRuleBuilder";

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

// Platform-specific MCP types
export type { GoogleMcp } from "./platforms/google/adapter/googleMcp";
export type {
  LocalMcp,
  GithubMcp,
  SlackMcp,
  GrowiMcp,
  RedashMcp,
  RedmineMcp,
} from "./core/mcpRegistry";

// Platform-specific payload types
export type {
  LocalReadPayload,
  LocalListPayload,
  LocalSearchByNamePayload,
  LocalSearchCodePayload,
} from "./platforms/local/domain/repositories/localRepositoryPayload";
export type { GoogleDriveFilePayload } from "./platforms/google/domain/repositories/googleRepositoryPayload";
export type {
  GitHubPullRequestListItemPayload,
  GitHubPullRequestPayload,
  GitHubPullRequestCommentPayload,
  GitHubLabelPayload,
  GitHubIssueSearchPayload,
  GitHubIssueSearchItemPayload,
} from "./platforms/github/domain/repositories/githubRepositoryPayload";
export type { GitHubRepository } from "./platforms/github/domain/repositories/githubRepository";
export { makeGitHubRepository } from "./platforms/github/infrastructure/repositories/githubRepository";
export type { RedashQueryPayload } from "./platforms/redash/domain/repositories/redashRepositoryPayload";
export type { RedmineIssuePayload } from "./platforms/redmine/domain/repositories/redmineRepositoryPayload";
export type {
  GrowiSearchPayload,
  GrowiPageData,
} from "./platforms/growi/domain/repositories/growiRepositoryPayload";
export type {
  SlackMessagePayload,
  SlackConversationHistoryPayload,
  SlackPostMessagePayload,
  SlackSearchMessagesPayload,
  SlackAddReactionPayload,
} from "./platforms/slack/domain/repositories/slackRepositoryPayload";

// AI Model payload types (Request)
export type {
  ClaudeMessage,
  ClaudeToolUseSchema,
  ClaudeContentBlock,
  ClaudeToolUseRequestContent,
  ClaudeToolUseResultContent,
} from "./aiModels/claude/domain/repositories/claudeRepositoryRequestPayload";
export type { ToolUseDataSet } from "./aiModels/claude/domain/entities/toolUseDataSet";

// AI Model payload types (Response)
export type {
  ClaudeJsonPayload,
  ClaudeCreateMessagePayload,
} from "./aiModels/claude/domain/repositories/claudeRepositoryResponsePayload";

// Claude拡張ペイロード
export type {
  ClaudeTextPayload,
  ClaudeExtendedTextPayload,
  ClaudeExtendedMetadata,
  ClaudeMetadata,
} from "./aiModels/claude/domain/repositories/claudeExtendedPayload";
export {
  hasToolUse,
  extractToolUses,
  extractToolUsesFromMetadata,
} from "./aiModels/claude/domain/repositories/claudeExtendedPayload";

// AI Model types
export type { ClaudeAiModel } from "./core/aiModelRegistry";

// AI Model utilities
export { buildToolUseSchema } from "./aiModels/claude/adapter/utils/buildToolUseSchema";
export {
  makeToolUseSchemaBuilder,
  type ToolUseSchemaBuilder,
} from "./aiModels/claude/domain/services/toolUseSchemaBuilder";
export {
  buildClaudeToolUseDataSet,
  convertToolUseResultForImages,
} from "./aiModels/claude/domain/services/toolUseDataSetBuilder";
export { executeToolUse } from "./aiModels/claude/domain/services/toolUseExecutor";
export { parseToolUseRequest } from "./aiModels/claude/domain/services/toolUseRequestParser";

// Executor utilities
export {
  executeRepeatedCallback,
  executeWithRetry,
  type RetryStrategy,
  type CallbackWithResult,
  defaultRetryStrategy,
} from "./core/exector/callbackExecutor";
