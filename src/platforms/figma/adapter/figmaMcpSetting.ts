import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import { FigmaConfig, loadFigmaConfig } from "../domain/settings/figmaConfig";
import { FigmaEnv, loadFigmaEnv } from "../infrastructure/env/figmaEnv";

export type FigmaMcpSetting = McpSetting<FigmaConfig, FigmaEnv>;

export const makeFigmaMcpSetting = (): FigmaMcpSetting => ({
  getConfig: async () => {
    return loadFigmaConfig();
  },
  getEnv: async () => {
    return loadFigmaEnv();
  },
});
