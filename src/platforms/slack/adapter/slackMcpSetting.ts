import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import { SlackConfig, loadSlackConfig } from "../domain/settings/slackConfig";
import { SlackEnv, loadSlackEnv } from "../infrastructure/env/slackEnv";

export type SlackMcpSetting = McpSetting<SlackConfig, SlackEnv>;

export const makeSlackMcpSetting = (): SlackMcpSetting => ({
  getConfig: async () => {
    return loadSlackConfig();
  },
  getEnv: async () => {
    return loadSlackEnv();
  },
});
