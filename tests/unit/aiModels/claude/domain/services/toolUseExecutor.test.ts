import type { ClaudeToolUseRequestContent } from "@aiModels/claude/domain/repositories/claudeRepositoryRequestPayload";
import { executeToolUse } from "@aiModels/claude/domain/services/toolUseExecutor";
import { getMcp } from "@core/mcpRegistry";
import { Result } from "@core/result/result";

// getMcpをモック化
jest.mock("@core/mcpRegistry", () => ({
  getMcp: jest.fn(),
}));

describe("executeToolUse", () => {
  const mockGetMcp = getMcp as jest.MockedFunction<typeof getMcp>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("正常系", () => {
    it("tool_useを正しく実行して結果を返すこと", async () => {
      const toolUseRequest: ClaudeToolUseRequestContent = {
        type: "tool_use",
        id: "toolu_123",
        name: "web_search",
        input: { query: "test" },
      };

      const mockResult: Result<unknown> = {
        isSuccess: true,
        payload: { result: "found" },
        status: 200,
      };

      const mockFunction = jest.fn().mockResolvedValue(mockResult);

      mockGetMcp.mockReturnValue({
        mcpMetadata: {} as any,
        mcpFunctions: {
          search: mockFunction,
        },
        mcpSetting: {} as any,
      } as any);

      const result = await executeToolUse(toolUseRequest);

      expect(mockGetMcp).toHaveBeenCalledWith("web");
      expect(mockFunction).toHaveBeenCalledWith("test");
      expect(result).toEqual(mockResult);
    });

    it("複数の引数を持つtool_useを正しく実行できること", async () => {
      const toolUseRequest: ClaudeToolUseRequestContent = {
        type: "tool_use",
        id: "toolu_123",
        name: "slack_getThreadMessages",
        input: {
          channelId: "C123",
          threadTs: "1234567890.123456",
        },
      };

      const mockResult: Result<unknown> = {
        isSuccess: true,
        payload: { messages: [] },
        status: 200,
      };

      const mockFunction = jest.fn().mockResolvedValue(mockResult);

      mockGetMcp.mockReturnValue({
        mcpMetadata: {} as any,
        mcpFunctions: {
          getThreadMessages: mockFunction,
        },
        mcpSetting: {} as any,
      } as any);

      const result = await executeToolUse(toolUseRequest);

      expect(mockGetMcp).toHaveBeenCalledWith("slack");
      expect(mockFunction).toHaveBeenCalledWith("C123", "1234567890.123456");
      expect(result).toEqual(mockResult);
    });

    it("引数なしのtool_useを正しく実行できること", async () => {
      const toolUseRequest: ClaudeToolUseRequestContent = {
        type: "tool_use",
        id: "toolu_123",
        name: "redash_getQueries",
        input: {},
      };

      const mockResult: Result<unknown> = {
        isSuccess: true,
        payload: { queries: [] },
        status: 200,
      };

      const mockFunction = jest.fn().mockResolvedValue(mockResult);

      mockGetMcp.mockReturnValue({
        mcpMetadata: {} as any,
        mcpFunctions: {
          getQueries: mockFunction,
        },
        mcpSetting: {} as any,
      } as any);

      const result = await executeToolUse(toolUseRequest);

      expect(mockGetMcp).toHaveBeenCalledWith("redash");
      expect(mockFunction).toHaveBeenCalledWith();
      expect(result).toEqual(mockResult);
    });
  });

  describe("異常系", () => {
    it("存在しないプラットフォーム名の場合はエラーをスローすること", async () => {
      const toolUseRequest: ClaudeToolUseRequestContent = {
        type: "tool_use",
        id: "toolu_123",
        name: "unknown_search",
        input: { query: "test" },
      };

      mockGetMcp.mockImplementation(() => {
        throw new Error("MCP not found");
      });

      await expect(executeToolUse(toolUseRequest)).rejects.toThrow(
        "MCP not found",
      );
    });

    it("存在しない関数名の場合はエラーをスローすること", async () => {
      const toolUseRequest: ClaudeToolUseRequestContent = {
        type: "tool_use",
        id: "toolu_123",
        name: "web_unknownFunction",
        input: { query: "test" },
      };

      mockGetMcp.mockReturnValue({
        mcpMetadata: {} as any,
        mcpFunctions: {},
        mcpSetting: {} as any,
      } as any);

      await expect(executeToolUse(toolUseRequest)).rejects.toThrow(
        "Unknown function: web:unknownFunction",
      );
    });

    it("関数がfunction型でない場合はエラーをスローすること", async () => {
      const toolUseRequest: ClaudeToolUseRequestContent = {
        type: "tool_use",
        id: "toolu_123",
        name: "web_search",
        input: { query: "test" },
      };

      mockGetMcp.mockReturnValue({
        mcpMetadata: {} as any,
        mcpFunctions: {
          search: "not a function",
        },
        mcpSetting: {} as any,
      } as any);

      await expect(executeToolUse(toolUseRequest)).rejects.toThrow(
        "Unknown function: web:search",
      );
    });

    it("関数の実行が失敗した場合はエラーをスローすること", async () => {
      const toolUseRequest: ClaudeToolUseRequestContent = {
        type: "tool_use",
        id: "toolu_123",
        name: "web_search",
        input: { query: "test" },
      };

      const mockFunction = jest
        .fn()
        .mockRejectedValue(new Error("Function execution failed"));

      mockGetMcp.mockReturnValue({
        mcpMetadata: {} as any,
        mcpFunctions: {
          search: mockFunction,
        },
        mcpSetting: {} as any,
      } as any);

      await expect(executeToolUse(toolUseRequest)).rejects.toThrow(
        "Function execution failed",
      );
    });
  });
});
