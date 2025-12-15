import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
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
} from "../domain/repositories/playwrightRepositoryPayload";
import { loadPlaywrightEnv } from "../infrastructure/env/playwrightEnv";
import { makePlaywrightRepository } from "../infrastructure/repositories/playwrightRepository";
import { makePlaywrightMcpMetadata } from "./playwrightMcpMetadata";
import { makePlaywrightMcpSetting } from "./playwrightMcpSetting";

type PlaywrightMcpFunctions = {
  navigate: McpFunction<PlaywrightNavigatePayload, [string]>;
  click: McpFunction<PlaywrightClickPayload, [string]>;
  type: McpFunction<PlaywrightTypePayload, [string, string]>;
  screenshot: McpFunction<PlaywrightScreenshotPayload, [string?]>;
  snapshot: McpFunction<PlaywrightSnapshotPayload, []>;
  evaluate: McpFunction<PlaywrightEvaluatePayload, [string]>;
  getTextContent: McpFunction<PlaywrightGetTextContentPayload, []>;
  waitForSelector: McpFunction<
    PlaywrightWaitForSelectorPayload,
    [string, number?]
  >;
  selectOption: McpFunction<PlaywrightSelectOptionPayload, [string, string[]]>;
};

export const makePlaywrightMcp = ({
  repository = makePlaywrightRepository(loadPlaywrightEnv().baseUrl),
} = {}): Mcp<PlaywrightMcpFunctions> => {
  return {
    mcpFunctions: {
      navigate: async (url: string) => {
        return repository.navigate(url);
      },
      click: async (selector: string) => {
        return repository.click(selector);
      },
      type: async (selector: string, text: string) => {
        return repository.type(selector, text);
      },
      screenshot: async (path?: string) => {
        return repository.screenshot(path);
      },
      snapshot: async () => {
        return repository.snapshot();
      },
      evaluate: async (script: string) => {
        return repository.evaluate(script);
      },
      getTextContent: async () => {
        return repository.getTextContent();
      },
      waitForSelector: async (selector: string, timeout?: number) => {
        return repository.waitForSelector(selector, timeout);
      },
      selectOption: async (selector: string, values: string[]) => {
        return repository.selectOption(selector, values);
      },
    },
    mcpMetadata: makePlaywrightMcpMetadata(),
    mcpSetting: makePlaywrightMcpSetting(),
  };
};
