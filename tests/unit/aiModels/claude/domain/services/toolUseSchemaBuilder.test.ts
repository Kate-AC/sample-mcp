import { makeToolUseSchemaBuilder } from "@aiModels/claude/domain/services/toolUseSchemaBuilder";
import type { Mcp } from "@core/contracts/mcp/mcp";
import type { McpMetadata } from "@core/contracts/mcp/mcpMetadata";
import type { McpRegistry } from "@core/mcpRegistry";

describe("makeToolUseSchemaBuilder", () => {
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
          command: "getIssue <issueId>",
          description: "Redmineチケットを取得",
          usage: "npm run cli redmine:getIssue",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["redmine"],
        getMcp: () => mockMcp,
      } as any;

      const builder = makeToolUseSchemaBuilder({ mcpRegistry: mockRegistry });
      const tools = builder.buildFromMcpNames(["redmine"]);

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
          },
          required: ["issueId"],
        },
      });
    });

    it("複数のMCPから正しくツールスキーマを生成できること", () => {
      const redmineMetadata = createMockMetadata([
        {
          command: "getIssue <issueId>",
          description: "Redmineチケットを取得",
          usage: "npm run cli redmine:getIssue",
        },
      ]);

      const slackMetadata = createMockMetadata([
        {
          command: "getThreadMessages <messageUrl>",
          description: "スレッドメッセージを取得",
          usage: "npm run cli slack:getThreadMessages",
        },
      ]);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["redmine", "slack"],
        getMcp: (name: string) => {
          if (name === "redmine") return createMockMcp(redmineMetadata);
          if (name === "slack") return createMockMcp(slackMetadata);
          throw new Error(`Unknown MCP: ${name}`);
        },
      } as any;

      const builder = makeToolUseSchemaBuilder({ mcpRegistry: mockRegistry });
      const tools = builder.buildFromMcpNames(["redmine", "slack"]);

      expect(tools).toHaveLength(2);
      expect(tools[0]?.name).toBe("redmine_getIssue");
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

      const builder = makeToolUseSchemaBuilder({ mcpRegistry: mockRegistry });
      const tools = builder.buildFromMcpNames(["redmine"]);

      expect(tools).toHaveLength(1);
      expect(tools[0]?.input_schema.properties).toHaveProperty("issueId");
      expect(tools[0]?.input_schema.properties).toHaveProperty("queryParams");
      expect(tools[0]?.input_schema.required).toEqual(["issueId"]);
    });

    it("空のMCP名配列を渡した場合、空配列を返すこと", () => {
      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => [],
        getMcp: () => createMockMcp(createMockMetadata([])),
      } as any;

      const builder = makeToolUseSchemaBuilder({ mcpRegistry: mockRegistry });
      const tools = builder.buildFromMcpNames([]);

      expect(tools).toHaveLength(0);
    });

    it("デフォルト引数でmcpRegistryが使用できること", () => {
      const builder = makeToolUseSchemaBuilder();
      expect(builder).toBeDefined();
      expect(typeof builder.buildFromMcpNames).toBe("function");
    });
  });

  describe("異常系", () => {
    it("無効なusage形式の場合、エラーを投げること", () => {
      const mockMetadata = createMockMetadata([
        {
          command: "search <query>",
          description: "検索を実行",
          usage: "invalid:format",
        },
      ]);

      const mockMcp = createMockMcp(mockMetadata);

      const mockRegistry: McpRegistry = {
        getAllMcpNames: () => ["web"],
        getMcp: () => mockMcp,
      } as any;

      const builder = makeToolUseSchemaBuilder({ mcpRegistry: mockRegistry });

      expect(() => {
        builder.buildFromMcpNames(["web"]);
      }).toThrow("Invalid usage format: invalid:format");
    });
  });
});
