import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import {
  RedashConfig,
  loadRedashConfig,
} from "../domain/settings/redashConfig";
import { RedashEnv, loadRedashEnv } from "../infrastructure/env/redashEnv";

export type RedashMcpSetting = McpSetting<RedashConfig, RedashEnv>;

export const makeRedashMcpSetting = (): RedashMcpSetting => ({
  getConfig: async () => {
    return loadRedashConfig();
  },
  getEnv: async () => {
    return loadRedashEnv();
  },
});
