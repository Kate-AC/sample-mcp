import type { Mcp } from "@core/contracts/mcp/mcp";
import type { McpMetadata } from "@core/contracts/mcp/mcpMetadata";
import type { McpRegistry } from "@core/mcpRegistry";
import { makeSecurityRuleBuilder } from "@core/services/securityRuleBuilder";

describe("makeSecurityRuleBuilder", () => {
  const createMockMetadata = (securityRules: string[]): McpMetadata => ({
    getSummary: () => [],
    getUsageContext: () => [],
    getCommands: () => [],
    getSecurityRules: () => securityRules,
  });

  const createMockMcp = (metadata: McpMetadata): Mcp => ({
    mcpMetadata: metadata,
    mcpFunctions: {},
    mcpSetting: {} as any,
  });

  describe("正常系", () => {
    it("単一のMCPから正しくセキュリティルールを生成できること", () => {
      const mockMetadata = createMockMetadata([
        "絶対禁止: ファイルの削除・アップロード・アーカイブ・非公開化する行為",
        "絶対禁止: 個人情報を記載する行為",
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["slack"],
        getMcp: () => mockMcp,
      } as any;

      const builder = makeSecurityRuleBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames(["slack"]);

      expect(result).toContain("【セキュリティルール】");
      expect(result).toContain(
        "[slack] 絶対禁止: ファイルの削除・アップロード・アーカイブ・非公開化する行為",
      );
      expect(result).toContain("[slack] 絶対禁止: 個人情報を記載する行為");
    });

    it("複数のMCPから正しくセキュリティルールを生成できること", () => {
      const slackMetadata = createMockMetadata([
        "絶対禁止: ファイルの削除・アップロード・アーカイブ・非公開化する行為",
      ]);

      const githubMetadata = createMockMetadata([
        "絶対禁止: 個人情報（人物名/メールアドレス/電話番号）はコミットおよびPRへの記載",
      ]);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["slack", "github"],
        getMcp: (name: string) => {
          if (name === "slack") return createMockMcp(slackMetadata);
          if (name === "github") return createMockMcp(githubMetadata);
          throw new Error(`Unknown MCP: ${name}`);
        },
      } as any;

      const builder = makeSecurityRuleBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames(["slack", "github"]);

      expect(result).toContain("【セキュリティルール】");
      expect(result).toContain(
        "[slack] 絶対禁止: ファイルの削除・アップロード・アーカイブ・非公開化する行為",
      );
      expect(result).toContain(
        "[github] 絶対禁止: 個人情報（人物名/メールアドレス/電話番号）はコミットおよびPRへの記載",
      );
    });

    it("セキュリティルールが空の場合、空文字列を返すこと", () => {
      const mockMetadata = createMockMetadata([]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["web"],
        getMcp: () => mockMcp,
      } as any;

      const builder = makeSecurityRuleBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames(["web"]);

      expect(result).toBe("");
    });

    it("空のMCP名配列を渡した場合、空文字列を返すこと", () => {
      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => [],
        getMcp: () => createMockMcp(createMockMetadata([])),
      } as any;

      const builder = makeSecurityRuleBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames([]);

      expect(result).toBe("");
    });

    it("セキュリティルールがないMCPを除外すること", () => {
      const slackMetadata = createMockMetadata([
        "絶対禁止: ファイルの削除・アップロード・アーカイブ・非公開化する行為",
      ]);

      const webMetadata = createMockMetadata([]);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["slack", "web"],
        getMcp: (name: string) => {
          if (name === "slack") return createMockMcp(slackMetadata);
          if (name === "web") return createMockMcp(webMetadata);
          throw new Error(`Unknown MCP: ${name}`);
        },
      } as any;

      const builder = makeSecurityRuleBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames(["slack", "web"]);

      expect(result).toContain("[slack]");
      expect(result).not.toContain("[web]");
    });

    it("デフォルト引数でmcpRegistryが使用できること", () => {
      const builder = makeSecurityRuleBuilder();
      expect(builder).toBeDefined();
      expect(typeof builder.buildFromMcpNames).toBe("function");
    });
  });
});
