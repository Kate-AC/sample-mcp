import { getEnv } from "@infrastructure/shared/env";

export type PlaywrightEnv = {
  /** playwright-mcp サーバーのベースURL（例: http://localhost:8931） */
  baseUrl: string;
};

export function loadPlaywrightEnv(): PlaywrightEnv {
  return {
    baseUrl: getEnv("PLAYWRIGHT_MCP_BASE_URL", "http://localhost:8931"),
  };
}
