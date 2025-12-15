import type { McpRegistry, PlatformName } from "../mcpRegistry";
import { mcpRegistry as getMcpRegistry } from "../mcpRegistry";

export interface SecurityRuleBuilder {
  buildFromMcpNames: (mcpNames: PlatformName[]) => string;
}

/**
 * セキュリティルールビルダーを作成
 */
export const makeSecurityRuleBuilder = (
  deps: {
    mcpRegistry: McpRegistry;
  } = {
    mcpRegistry: getMcpRegistry(),
  },
): SecurityRuleBuilder => {
  return {
    buildFromMcpNames: (mcpNames: PlatformName[]): string => {
      const rules = mcpNames.flatMap((mcpName) => {
        const mcp = deps.mcpRegistry.getMcp(mcpName);
        const securityRules = mcp.mcpMetadata.getSecurityRules();
        return securityRules.length > 0
          ? securityRules.map((rule) => `[${mcpName}] ${rule}`)
          : [];
      });

      if (rules.length === 0) {
        return "";
      }

      return "【セキュリティルール】\n" + rules.map((r) => `- ${r}`).join("\n");
    },
  };
};
