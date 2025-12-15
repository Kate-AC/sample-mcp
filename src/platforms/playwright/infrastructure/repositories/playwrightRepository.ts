import * as fs from "fs";
import * as nodePath from "path";
import { ErrorType, Result } from "@core/result/result";
import { PlaywrightRepository } from "../../domain/repositories/playwrightRepository";
import {
  PlaywrightClickPayload,
  PlaywrightEvaluatePayload,
  PlaywrightGetTextContentPayload,
  PlaywrightNavigatePayload,
  PlaywrightScreenshotPayload,
  PlaywrightSelectOptionPayload,
  PlaywrightSnapshotPayload,
  PlaywrightTypePayload,
  PlaywrightWaitForSelectorPayload,
} from "../../domain/repositories/playwrightRepositoryPayload";
import {
  PlaywrightMcpClient,
  makePlaywrightMcpClient,
} from "../http/playwrightMcpClient";

const safeCall = async <T>(
  fn: () => Promise<T>,
  errorMessage: string,
): Promise<Result<T>> => {
  try {
    const payload = await fn();
    return { payload, status: 200, isSuccess: true, message: "ok" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      payload: null as unknown as T,
      status: 500,
      isSuccess: false,
      message: `${errorMessage}: ${msg}`,
      errorType: ErrorType.OTHER_ERROR,
    };
  }
};

export const makePlaywrightRepository = (
  baseUrl: string,
): PlaywrightRepository => {
  let client: PlaywrightMcpClient | null = null;
  let initialized = false;

  const getClient = async (): Promise<PlaywrightMcpClient> => {
    if (!client) {
      client = makePlaywrightMcpClient(baseUrl);
    }
    if (!initialized) {
      await client.initialize();
      initialized = true;
    }
    return client;
  };

  return {
    navigate: async (url: string): Promise<Result<PlaywrightNavigatePayload>> =>
      safeCall(async () => {
        const c = await getClient();
        await c.callTool("browser_navigate", { url });
        return { url, title: "" };
      }, "Failed to navigate"),

    click: async (selector: string): Promise<Result<PlaywrightClickPayload>> =>
      safeCall(async () => {
        const c = await getClient();
        const args = selector.startsWith("ref=")
          ? { element: selector, ref: selector.replace("ref=", "") }
          : { element: selector, ref: selector };
        await c.callTool("browser_click", args);
        return { selector, success: true };
      }, "Failed to click"),

    type: async (
      selector: string,
      text: string,
    ): Promise<Result<PlaywrightTypePayload>> =>
      safeCall(async () => {
        const c = await getClient();
        await c.callTool("browser_type", {
          element: selector,
          ref: selector,
          text,
        });
        return { selector, text, success: true };
      }, "Failed to type"),

    screenshot: async (
      savePath?: string,
    ): Promise<Result<PlaywrightScreenshotPayload>> =>
      safeCall(async () => {
        const c = await getClient();
        const result = await c.callTool<string>("browser_take_screenshot", {});
        const base64 = result.content ?? "";
        const screenshotDir = nodePath.resolve(
          __dirname,
          "../../../../..",
          "screenshots",
        );
        const resolvedPath = savePath
          ? nodePath.resolve(savePath)
          : nodePath.join(screenshotDir, `screenshot-${Date.now()}.png`);
        fs.mkdirSync(nodePath.dirname(resolvedPath), { recursive: true });
        fs.writeFileSync(resolvedPath, Buffer.from(base64, "base64"));
        return { base64, path: resolvedPath };
      }, "Failed to take screenshot"),

    snapshot: async (): Promise<Result<PlaywrightSnapshotPayload>> =>
      safeCall(async () => {
        const c = await getClient();
        const result = await c.callTool<string>("browser_snapshot", {});
        return {
          url: "",
          title: "",
          snapshot: result.content ?? "",
        };
      }, "Failed to take snapshot"),

    evaluate: async (
      script: string,
    ): Promise<Result<PlaywrightEvaluatePayload>> =>
      safeCall(async () => {
        const c = await getClient();
        const result = await c.callTool<unknown>("browser_evaluate", {
          function: script,
        });
        return { result: result.content };
      }, "Failed to evaluate"),

    getTextContent: async (): Promise<
      Result<PlaywrightGetTextContentPayload>
    > =>
      safeCall(async () => {
        const c = await getClient();
        const result = await c.callTool<string>("browser_get_text_content", {});
        return {
          url: "",
          title: "",
          content: result.content ?? "",
        };
      }, "Failed to get text content"),

    waitForSelector: async (
      selector: string,
      timeout = 30000,
    ): Promise<Result<PlaywrightWaitForSelectorPayload>> =>
      safeCall(async () => {
        const c = await getClient();
        await c.callTool("browser_wait_for", {
          selector,
          timeout,
        });
        return { selector, found: true };
      }, "Failed to wait for selector"),

    selectOption: async (
      selector: string,
      values: string[],
    ): Promise<Result<PlaywrightSelectOptionPayload>> =>
      safeCall(async () => {
        const c = await getClient();
        await c.callTool("browser_select_option", {
          element: selector,
          ref: selector,
          values,
        });
        return { selector, values, success: true };
      }, "Failed to select option"),
  };
};
