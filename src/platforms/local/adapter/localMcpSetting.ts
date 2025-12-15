import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import { LocalEnv, loadLocalEnv } from "../infrastructure/env/localEnv";

/**
 * Local MCPの設定
 */
export type LocalMcpSetting = McpSetting<Record<string, never>, LocalEnv>;

export const makeLocalMcpSetting = (): LocalMcpSetting => ({
  getConfig: async () => {
    return {};
  },
  getEnv: async () => {
    return loadLocalEnv();
  },
});
