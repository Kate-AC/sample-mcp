import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import { WebConfig, loadWebConfig } from "../domain/settings/webConfig";
import { WebEnv, loadWebEnv } from "../infrastructure/env/webEnv";

export type WebMcpSetting = McpSetting<WebConfig, WebEnv>;

export const makeWebMcpSetting = (): WebMcpSetting => ({
  getConfig: async () => {
    return loadWebConfig();
  },
  getEnv: async () => {
    return loadWebEnv();
  },
});
