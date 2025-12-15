import type { McpRegistry, PlatformName } from "../mcpRegistry";
import { mcpRegistry as getMcpRegistry } from "../mcpRegistry";

export interface UsageContextBuilder {
  buildFromMcpNames: (mcpNames: PlatformName[]) => string;
}

/**
 * 利用コンテキストビルダーを作成
 */
export const makeUsageContextBuilder = (
  deps: {
    mcpRegistry: McpRegistry;
  } = {
    mcpRegistry: getMcpRegistry(),
  },
): UsageContextBuilder => {
  return {
    buildFromMcpNames: (mcpNames: PlatformName[]): string => {
      const contexts = mcpNames.flatMap((mcpName) => {
        const mcp = deps.mcpRegistry.getMcp(mcpName);
        const usageContext = mcp.mcpMetadata.getUsageContext();
        return usageContext.length > 0
          ? usageContext.map((context) => `[${mcpName}] ${context}`)
          : [];
      });

      if (contexts.length === 0) {
        return "";
      }

      return (
        "【各ツールの利用場面】\n" + contexts.map((c) => `- ${c}`).join("\n")
      );
    },
  };
};
