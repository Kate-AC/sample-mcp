import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import {
  DatadogConfig,
  loadDatadogConfig,
} from "../domain/settings/datadogConfig";
import { DatadogEnv, loadDatadogEnv } from "../infrastructure/env/datadogEnv";

export type DatadogMcpSetting = McpSetting<DatadogConfig, DatadogEnv>;

export const makeDatadogMcpSetting = (): DatadogMcpSetting => ({
  getConfig: async () => {
    return loadDatadogConfig();
  },
  getEnv: async () => {
    return loadDatadogEnv();
  },
});
