import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import { WebFetchImagePayload } from "../domain/repositories/webRepositoryPayload";
import { makeWebRepository } from "../infrastructure/repositories/webRepository";
import { makeWebMcpMetadata } from "./webMcpMetadata";
import { makeWebMcpSetting } from "./webMcpSetting";

type WebMcpFunctions = {
  fetchImage: McpFunction<WebFetchImagePayload, [string]>;
};

export const makeWebMcp = ({
  webRepository = makeWebRepository(),
} = {}): Mcp<WebMcpFunctions> => ({
  mcpFunctions: {
    fetchImage: async (url: string) => {
      return webRepository.fetchImage(url);
    },
  },
  mcpMetadata: makeWebMcpMetadata(),
  mcpSetting: makeWebMcpSetting(),
});
