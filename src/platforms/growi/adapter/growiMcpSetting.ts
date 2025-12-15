import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import { GrowiConfig, loadGrowiConfig } from "../domain/settings/growiConfig";
import { GrowiEnv, loadGrowiEnv } from "../infrastructure/env/growiEnv";

export type GrowiMcpSetting = McpSetting<GrowiConfig, GrowiEnv>;

export const makeGrowiMcpSetting = (): GrowiMcpSetting => ({
  getConfig: async () => {
    return loadGrowiConfig();
  },
  getEnv: async () => {
    return loadGrowiEnv();
  },
});
