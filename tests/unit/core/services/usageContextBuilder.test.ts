import type { Mcp } from "@core/contracts/mcp/mcp";
import type { McpMetadata } from "@core/contracts/mcp/mcpMetadata";
import type { McpRegistry } from "@core/mcpRegistry";
import { makeUsageContextBuilder } from "@core/services/usageContextBuilder";

describe("makeUsageContextBuilder", () => {
  const createMockMetadata = (usageContext: string[]): McpMetadata => ({
    getSummary: () => [],
    getUsageContext: () => usageContext,
    getCommands: () => [],
    getSecurityRules: () => [],
  });

  const createMockMcp = (metadata: McpMetadata): Mcp => ({
    mcpMetadata: metadata,
    mcpFunctions: {},
    mcpSetting: {} as any,
  });

  describe("正常系", () => {
    it("単一のMCPから正しく利用コンテキストを生成できること", () => {
      const mockMetadata = createMockMetadata([
        "チケットの詳細を確認する場合",
        "案件の全容を確認する場合",
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["redmine"],
        getMcp: () => mockMcp,
      } as any;

      const builder = makeUsageContextBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames(["redmine"]);

      expect(result).toContain("【各ツールの利用場面】");
      expect(result).toContain("[redmine] チケットの詳細を確認する場合");
      expect(result).toContain("[redmine] 案件の全容を確認する場合");
    });

    it("複数のMCPから正しく利用コンテキストを生成できること", () => {
      const redmineMetadata = createMockMetadata([
        "チケットの詳細を確認する場合",
      ]);

      const slackMetadata = createMockMetadata([
        "スレッドの履歴を確認する場合",
        "メッセージを検索する場合",
      ]);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["redmine", "slack"],
        getMcp: (name: string) => {
          if (name === "redmine") return createMockMcp(redmineMetadata);
          if (name === "slack") return createMockMcp(slackMetadata);
          throw new Error(`Unknown MCP: ${name}`);
        },
      } as any;

      const builder = makeUsageContextBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames(["redmine", "slack"]);

      expect(result).toContain("【各ツールの利用場面】");
      expect(result).toContain("[redmine] チケットの詳細を確認する場合");
      expect(result).toContain("[slack] スレッドの履歴を確認する場合");
      expect(result).toContain("[slack] メッセージを検索する場合");
    });

    it("利用コンテキストが空の場合、空文字列を返すこと", () => {
      const mockMetadata = createMockMetadata([]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["web"],
        getMcp: () => mockMcp,
      } as any;

      const builder = makeUsageContextBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames(["web"]);

      expect(result).toBe("");
    });

    it("空のMCP名配列を渡した場合、空文字列を返すこと", () => {
      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => [],
        getMcp: () => createMockMcp(createMockMetadata([])),
      } as any;

      const builder = makeUsageContextBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames([]);

      expect(result).toBe("");
    });

    it("利用コンテキストがないMCPを除外すること", () => {
      const redmineMetadata = createMockMetadata([
        "チケットの詳細を確認する場合",
      ]);

      const webMetadata = createMockMetadata([]);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["redmine", "web"],
        getMcp: (name: string) => {
          if (name === "redmine") return createMockMcp(redmineMetadata);
          if (name === "web") return createMockMcp(webMetadata);
          throw new Error(`Unknown MCP: ${name}`);
        },
      } as any;

      const builder = makeUsageContextBuilder({ mcpRegistry: mockRegistry });
      const result = builder.buildFromMcpNames(["redmine", "web"]);

      expect(result).toContain("[redmine]");
      expect(result).not.toContain("[web]");
    });

    it("デフォルト引数でmcpRegistryが使用できること", () => {
      const builder = makeUsageContextBuilder();
      expect(builder).toBeDefined();
      expect(typeof builder.buildFromMcpNames).toBe("function");
    });
  });
});
