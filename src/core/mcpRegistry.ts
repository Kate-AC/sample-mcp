import { makeDatadogMcp } from "../platforms/datadog/adapter/datadogMcp";
import { makeFigmaMcp } from "../platforms/figma/adapter/figmaMcp";
import { makeGithubMcp } from "../platforms/github/adapter/githubMcp";
import { makeGoogleMcp } from "../platforms/google/adapter/googleMcp";
import { makeGrowiMcp } from "../platforms/growi/adapter/growiMcp";
import { makeLocalMcp } from "../platforms/local/adapter/localMcp";
import { makePlaywrightMcp } from "../platforms/playwright/adapter/playwrightMcp";
import { makeRedashMcp } from "../platforms/redash/adapter/redashMcp";
import { makeRedmineMcp } from "../platforms/redmine/adapter/redmineMcp";
import { makeSlackMcp } from "../platforms/slack/adapter/slackMcp";
import { makeWebMcp } from "../platforms/web/adapter/webMcp";
import { Mcp } from "./contracts/mcp/mcp";

/**
 * MCPファクトリの定義
 * 各MCPは初回アクセス時に遅延初期化される
 */
const MCP_FACTORIES = {
  datadog: makeDatadogMcp,
  figma: makeFigmaMcp,
  local: makeLocalMcp,
  github: makeGithubMcp,
  google: makeGoogleMcp,
  slack: makeSlackMcp,
  growi: makeGrowiMcp,
  redash: makeRedashMcp,
  playwright: makePlaywrightMcp,
  redmine: makeRedmineMcp,
  web: makeWebMcp,
} as const;

export type PlatformName = keyof typeof MCP_FACTORIES;

/**
 * 遅延初期化されたMCPインスタンスのキャッシュ
 */
const mcpCache = new Map<PlatformName, Mcp>();

const getMcpInstance = (platform: PlatformName): Mcp => {
  if (!mcpCache.has(platform)) {
    const factory = MCP_FACTORIES[platform];
    if (!factory) {
      throw new Error(`Platform '${platform}' is not supported`);
    }
    mcpCache.set(platform, factory());
  }
  return mcpCache.get(platform)!;
};

// 関数オーバーロードで型安全性を確保
export function getMcp(platform: "datadog"): ReturnType<typeof makeDatadogMcp>;
export function getMcp(platform: "figma"): ReturnType<typeof makeFigmaMcp>;
export function getMcp(platform: "local"): ReturnType<typeof makeLocalMcp>;
export function getMcp(platform: "github"): ReturnType<typeof makeGithubMcp>;
export function getMcp(platform: "google"): ReturnType<typeof makeGoogleMcp>;
export function getMcp(platform: "slack"): ReturnType<typeof makeSlackMcp>;
export function getMcp(platform: "growi"): ReturnType<typeof makeGrowiMcp>;
export function getMcp(platform: "redash"): ReturnType<typeof makeRedashMcp>;
export function getMcp(
  platform: "playwright",
): ReturnType<typeof makePlaywrightMcp>;
export function getMcp(platform: "redmine"): ReturnType<typeof makeRedmineMcp>;
export function getMcp(platform: "web"): ReturnType<typeof makeWebMcp>;
export function getMcp(platform: PlatformName): Mcp;

export function getMcp(platform: PlatformName): Mcp {
  return getMcpInstance(platform);
}

export const getAllMcp = (): Mcp[] => {
  return getAllMcpNames().map((name) => getMcpInstance(name));
};

export const getAllMcpNames = (): PlatformName[] => {
  return Object.keys(MCP_FACTORIES) as PlatformName[];
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
export type DatadogMcp = ReturnType<typeof makeDatadogMcp>;
export type FigmaMcp = ReturnType<typeof makeFigmaMcp>;
export type LocalMcp = ReturnType<typeof makeLocalMcp>;
export type GithubMcp = ReturnType<typeof makeGithubMcp>;
export type GoogleMcp = ReturnType<typeof makeGoogleMcp>;
export type SlackMcp = ReturnType<typeof makeSlackMcp>;
export type GrowiMcp = ReturnType<typeof makeGrowiMcp>;
export type RedashMcp = ReturnType<typeof makeRedashMcp>;
export type PlaywrightMcp = ReturnType<typeof makePlaywrightMcp>;
export type RedmineMcp = ReturnType<typeof makeRedmineMcp>;
export type WebMcp = ReturnType<typeof makeWebMcp>;

// Re-export aiModelRegistry
export { aiModelRegistry, useAiModel } from "./aiModelRegistry";
export type { AiModelName } from "./aiModelRegistry";
