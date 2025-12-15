import axios from "axios";
import { spawn } from "child_process";
import * as path from "path";

/**
 * playwright-mcp プロキシデーモンと通信するクライアント
 *
 * プロキシデーモン（scripts/playwright-proxy.js）が @playwright/mcp を
 * MCP SDK の StdioClientTransport で起動し、HTTP API として公開している。
 * セッション管理は不要（stdio transport にはセッション概念がない）。
 *
 * プロキシが起動していない場合は自動的にバックグラウンドで起動する。
 */

export type PlaywrightMcpClient = {
  callTool: <T = unknown>(
    toolName: string,
    args: Record<string, unknown>,
  ) => Promise<PlaywrightMcpResponse<T>>;

  initialize: () => Promise<string | undefined>;
};

export type PlaywrightMcpResponse<T = unknown> = {
  content: T;
  isError: boolean;
};

const isProxyRunning = async (baseUrl: string): Promise<boolean> => {
  try {
    await axios.get(`${baseUrl}/health`, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
};

const waitForProxy = async (
  baseUrl: string,
  maxWaitMs = 15000,
): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (await isProxyRunning(baseUrl)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `Playwright proxy did not become ready within ${maxWaitMs}ms`,
  );
};

const startProxy = (baseUrl: string): void => {
  const proxyScript = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "scripts",
    "playwright-proxy.js",
  );
  const child = spawn("node", [proxyScript], {
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PLAYWRIGHT_MCP_PORT: new URL(baseUrl).port || "8931",
    },
  });
  child.unref();
};

export const makePlaywrightMcpClient = (
  baseUrl: string,
): PlaywrightMcpClient => {
  return {
    initialize: async () => {
      if (await isProxyRunning(baseUrl)) return "proxy";
      console.log("Playwright proxy not running. Starting automatically...");
      startProxy(baseUrl);
      await waitForProxy(baseUrl);
      console.log("Playwright proxy is ready.");
      return "proxy";
    },

    callTool: async <T = unknown>(
      toolName: string,
      args: Record<string, unknown>,
    ): Promise<PlaywrightMcpResponse<T>> => {
      const response = await axios.post(
        `${baseUrl}/call`,
        { tool: toolName, args },
        { timeout: 120000 },
      );

      const data = response.data;

      if (data.error) {
        return {
          content: (typeof data.error === "string"
            ? data.error
            : data.error.message || JSON.stringify(data.error)) as T,
          isError: true,
        };
      }

      const result = data.result;
      const textContent = result?.content
        ?.filter((c: { type: string }) => c.type === "text")
        ?.map((c: { text: string }) => c.text)
        ?.join("\n");

      const imageContent = result?.content?.find(
        (c: { type: string }) => c.type === "image",
      );

      const parsed = textContent ? tryParseJson(textContent) : textContent;

      return {
        content: (imageContent?.data ?? parsed ?? textContent) as T,
        isError: result?.isError ?? false,
      };
    },
  };
};

const tryParseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
