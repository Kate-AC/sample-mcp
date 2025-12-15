import { buildToolUseSchema } from "@aiModels/claude/adapter/utils/buildToolUseSchema";
import type { Mcp } from "@core/contracts/mcp/mcp";
import type { McpMetadata } from "@core/contracts/mcp/mcpMetadata";
import type { McpRegistry } from "@core/mcpRegistry";

describe("buildToolUseSchema", () => {
  const createMockMetadata = (commands: any[]): McpMetadata => ({
    getSummary: () => [],
    getUsageContext: () => [],
    getCommands: () => commands,
    getSecurityRules: () => [],
  });

  const createMockMcp = (metadata: McpMetadata): Mcp => ({
    mcpMetadata: metadata,
    mcpFunctions: {},
    mcpSetting: {} as any,
  });

  describe("正常系", () => {
    it("単一のMCPから正しくツールスキーマを生成できること", () => {
      const mockMetadata = createMockMetadata([
        {
          command: "search <query>",
          description: "FAQを検索",
          usage: "npm run cli faq:search",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["faq"],
        getMcp: () => mockMcp,
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toHaveLength(1);
      expect(tools[0]).toEqual({
        name: "faq_search",
        description: "FAQを検索",
        input_schema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "query parameter",
            },
          },
          required: ["query"],
        },
      });
    });

    it("複数のMCPから正しくツールスキーマを生成できること", () => {
      const faqMetadata = createMockMetadata([
        {
          command: "search <query>",
          description: "FAQを検索",
          usage: "npm run cli faq:search",
        },
      ]);

      const slackMetadata = createMockMetadata([
        {
          command: "getThreadMessages <channelId> <threadTs>",
          description: "スレッドメッセージを取得",
          usage: "npm run cli slack:getThreadMessages",
        },
      ]);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["faq", "slack"],
        getMcp: (name: string) => {
          if (name === "faq") return createMockMcp(faqMetadata);
          if (name === "slack") return createMockMcp(slackMetadata);
          throw new Error(`Unknown MCP: ${name}`);
        },
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toHaveLength(2);
      expect(tools[0]?.name).toBe("faq_search");
      expect(tools[1]?.name).toBe("slack_getThreadMessages");
    });

    it("オプショナルパラメータを正しく処理できること", () => {
      const mockMetadata = createMockMetadata([
        {
          command: "getIssue <issueId> [queryParams]",
          description: "Redmineチケットを取得",
          usage: "npm run cli redmine:getIssue",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["redmine"],
        getMcp: () => mockMcp,
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toHaveLength(1);
      expect(tools[0]).toEqual({
        name: "redmine_getIssue",
        description: "Redmineチケットを取得",
        input_schema: {
          type: "object",
          properties: {
            issueId: {
              type: "string",
              description: "issueId parameter",
            },
            queryParams: {
              type: "string",
              description: "queryParams parameter",
            },
          },
          required: ["issueId"],
        },
      });
    });

    it("パラメータなしのコマンドを正しく処理できること", () => {
      const mockMetadata = createMockMetadata([
        {
          command: "getQueries",
          description: "Redashクエリ一覧を取得",
          usage: "npm run cli redash:getQueries",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["redash"],
        getMcp: () => mockMcp,
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toHaveLength(1);
      expect(tools[0]).toEqual({
        name: "redash_getQueries",
        description: "Redashクエリ一覧を取得",
        input_schema: {
          type: "object",
          properties: {},
        },
      });
    });

    it("OR形式のパラメータを正しく処理できること", () => {
      const mockMetadata = createMockMetadata([
        {
          command: "search <searchQuery|queryParams>",
          description: "検索を実行",
          usage: "npm run cli test:search",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["test"],
        getMcp: () => mockMcp,
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toHaveLength(1);
      expect(tools[0]?.input_schema.properties).toHaveProperty("searchQuery");
      expect(
        tools[0]?.input_schema.properties["searchQuery"]?.description,
      ).toBe("searchQuery or queryParams");
      expect(tools[0]?.input_schema.required).toEqual(["searchQuery"]);
    });

    it("複数の必須パラメータを正しく処理できること", () => {
      const mockMetadata = createMockMetadata([
        {
          command: "postMessage <channelId> <message> <threadTs>",
          description: "Slackにメッセージを投稿",
          usage: "npm run cli slack:postMessage",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["slack"],
        getMcp: () => mockMcp,
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toHaveLength(1);
      expect(tools[0]?.input_schema.required).toEqual([
        "channelId",
        "message",
        "threadTs",
      ]);
    });

    it("必須とオプショナルの混在パラメータを正しく処理できること", () => {
      const mockMetadata = createMockMetadata([
        {
          command: "getFileContent <apiPath> [ref]",
          description: "GitHub ファイル内容を取得",
          usage: "npm run cli github:getFileContent",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["github"],
        getMcp: () => mockMcp,
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toHaveLength(1);
      expect(tools[0]?.input_schema.required).toEqual(["apiPath"]);
      expect(tools[0]?.input_schema.properties).toHaveProperty("apiPath");
      expect(tools[0]?.input_schema.properties).toHaveProperty("ref");
    });
  });

  describe("異常系", () => {
    it("不正なusage形式の場合はエラーをスローすること", () => {
      const mockMetadata = createMockMetadata([
        {
          command: "search <query>",
          description: "検索",
          usage: "invalid usage format",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["test"],
        getMcp: () => mockMcp,
      } as any;

      expect(() => buildToolUseSchema(mockRegistry)).toThrow(
        "Invalid usage format",
      );
    });

    it("MCPが存在しない場合は空配列を返すこと", () => {
      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => [],
        getMcp: () => {
          throw new Error("MCP not found");
        },
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toEqual([]);
    });

    it("コマンドが存在しない場合は空配列を返すこと", () => {
      const mockMetadata = createMockMetadata([]);
      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["test"],
        getMcp: () => mockMcp,
      } as any;

      const tools = buildToolUseSchema(mockRegistry);

      expect(tools).toEqual([]);
    });
  });

  describe("実際のMCPとの統合", () => {
    it("実際のmcpRegistryから正しくツールスキーマを生成できること", () => {
      // 実際のmcpRegistryをimportしてテスト
      const { mcpRegistry } = require("@core/mcpRegistry");
      const registry = mcpRegistry();

      const tools = buildToolUseSchema(registry);

      // 最低限のツールが生成されていることを確認
      expect(tools.length).toBeGreaterThan(0);

      // すべてのツールが正しい形式であることを確認
      tools.forEach((tool) => {
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("description");
        expect(tool).toHaveProperty("input_schema");
        expect(tool.input_schema).toHaveProperty("type");
        expect(tool.input_schema).toHaveProperty("properties");
        expect(tool.input_schema.type).toBe("object");
      });

      // ツール名がplatform_function形式であることを確認
      tools.forEach((tool) => {
        expect(tool.name).toMatch(/^\w+_\w+$/);
      });
    });
  });
});
