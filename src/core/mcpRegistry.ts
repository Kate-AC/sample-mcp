import { makeRedmineMcp } from "../platforms/redmine/adapter/redmineMcp";
import { makeSlackMcp } from "../platforms/slack/adapter/slackMcp";
import { Mcp } from "./contracts/mcp/mcp";

const PLATFORM_MCPS = {
  slack: makeSlackMcp(),
  redmine: makeRedmineMcp(),
} as const;

export type PlatformName = keyof typeof PLATFORM_MCPS;

// 関数オーバーロードで型安全性を確保
export function getMcp(platform: "slack"): ReturnType<typeof makeSlackMcp>;
export function getMcp(platform: "redmine"): ReturnType<typeof makeRedmineMcp>;
export function getMcp(platform: PlatformName): Mcp;

export function getMcp(platform: PlatformName): Mcp {
  const adapter = PLATFORM_MCPS[platform];

  if (!adapter) {
    throw new Error(`Platform '${platform}' is not supported`);
  }

  return adapter;
}

export const getAllMcp = (): Mcp[] => {
  return Object.values(PLATFORM_MCPS);
};

export const getAllMcpNames = (): PlatformName[] => {
  return Object.keys(PLATFORM_MCPS) as PlatformName[];
};

export type McpRegistry = {
  getMcp: typeof getMcp;
  getAllMcp: typeof getAllMcp;
  getAllMcpNames: typeof getAllMcpNames;
};

export const mcpRegistry = (): McpRegistry => ({
  getMcp,
  getAllMcp,
  getAllMcpNames,
});

// Platform-specific MCP types
export type SlackMcp = ReturnType<typeof makeSlackMcp>;
export type RedmineMcp = ReturnType<typeof makeRedmineMcp>;

// Re-export aiModelRegistry
export { aiModelRegistry, useAiModel } from "./aiModelRegistry";
export type { AiModelName } from "./aiModelRegistry";
