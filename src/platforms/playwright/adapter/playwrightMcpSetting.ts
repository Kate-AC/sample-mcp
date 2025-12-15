import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import {
  PlaywrightEnv,
  loadPlaywrightEnv,
} from "../infrastructure/env/playwrightEnv";

export type PlaywrightMcpSetting = McpSetting<
  Record<string, never>,
  PlaywrightEnv
>;

export const makePlaywrightMcpSetting = (): PlaywrightMcpSetting => ({
  getConfig: async () => {
    return {};
  },
  getEnv: async () => {
    return loadPlaywrightEnv();
  },
});
