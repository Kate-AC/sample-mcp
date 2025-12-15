import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import {
  GoogleConfig,
  loadGoogleConfig,
} from "../domain/settings/googleConfig";
import { GoogleEnv, loadGoogleEnv } from "../infrastructure/env/googleEnv";

export type GoogleMcpSetting = McpSetting<GoogleConfig, GoogleEnv>;

export const makeGoogleMcpSetting = (): GoogleMcpSetting => ({
  getConfig: async () => {
    return loadGoogleConfig();
  },
  getEnv: async () => {
    return loadGoogleEnv();
  },
});
