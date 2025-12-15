import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import {
  RedmineConfig,
  loadRedmineConfig,
} from "../domain/settings/redmineConfig";
import { RedmineEnv, loadRedmineEnv } from "../infrastructure/env/redmineEnv";

export type RedmineMcpSetting = McpSetting<RedmineConfig, RedmineEnv>;

export const makeRedmineMcpSetting = (): RedmineMcpSetting => ({
  getConfig: async () => {
    return loadRedmineConfig();
  },
  getEnv: async () => {
    return loadRedmineEnv();
  },
});
