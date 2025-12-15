import type {
  ClaudeToolUseRequestContent,
  ClaudeToolUseResultContent,
} from "@aiModels/claude/domain/repositories/claudeRepositoryRequestPayload";
import { buildClaudeToolUseDataSet } from "@aiModels/claude/domain/services/toolUseDataSetBuilder";

describe("buildClaudeToolUseDataSet", () => {
  describe("正常系", () => {
    it("tool_useとtool_resultのペアから正しくデータセットを作成できること", () => {
      const toolUseRequests: ClaudeToolUseRequestContent[] = [
        {
          type: "tool_use",
          id: "toolu_123",
          name: "web_search",
          input: { query: "test" },
        },
      ];

      const toolResults: ClaudeToolUseResultContent[] = [
        {
          type: "tool_result",
          tool_use_id: "toolu_123",
          content: '{"result": "found"}',
        },
      ];

      const result = buildClaudeToolUseDataSet(toolUseRequests, toolResults);

      expect(result).not.toBeNull();
      expect(result?.toolUseRequest.role).toBe("assistant");
      expect(result?.toolUseRequest.content).toEqual(toolUseRequests);
      expect(result?.toolUseResult.role).toBe("user");
      expect(result?.toolUseResult.content).toEqual(toolResults);
    });

    it("複数のtool_useとtool_resultのペアから正しくデータセットを作成できること", () => {
      const toolUseRequests: ClaudeToolUseRequestContent[] = [
        {
          type: "tool_use",
          id: "toolu_123",
          name: "web_search",
          input: { query: "test1" },
        },
        {
          type: "tool_use",
          id: "toolu_456",
          name: "slack_getThreadMessages",
          input: { channelId: "C123", threadTs: "1234567890.123456" },
        },
      ];

      const toolResults: ClaudeToolUseResultContent[] = [
        {
          type: "tool_result",
          tool_use_id: "toolu_123",
          content: '{"result": "found1"}',
        },
        {
          type: "tool_result",
          tool_use_id: "toolu_456",
          content: '{"result": "found2"}',
        },
      ];

      const result = buildClaudeToolUseDataSet(toolUseRequests, toolResults);

      expect(result).not.toBeNull();
      expect(result?.toolUseRequest.content).toHaveLength(2);
      expect(result?.toolUseResult.content).toHaveLength(2);
    });

    it("tool_useとtool_resultが両方空の場合はnullを返すこと", () => {
      const result = buildClaudeToolUseDataSet([], []);

      expect(result).toBeNull();
    });
  });

  describe("異常系", () => {
    it("tool_useに対応するtool_resultが不足している場合はエラーをスローすること", () => {
      const toolUseRequests: ClaudeToolUseRequestContent[] = [
        {
          type: "tool_use",
          id: "toolu_123",
          name: "web_search",
          input: { query: "test" },
        },
      ];

      const toolResults: ClaudeToolUseResultContent[] = [];

      expect(() =>
        buildClaudeToolUseDataSet(toolUseRequests, toolResults),
      ).toThrow("tool_useに対応するtool_resultが不足しています: toolu_123");
    });

    it("tool_resultに対応するtool_useが不足している場合はエラーをスローすること", () => {
      const toolUseRequests: ClaudeToolUseRequestContent[] = [];

      const toolResults: ClaudeToolUseResultContent[] = [
        {
          type: "tool_result",
          tool_use_id: "toolu_123",
          content: '{"result": "found"}',
        },
      ];

      expect(() =>
        buildClaudeToolUseDataSet(toolUseRequests, toolResults),
      ).toThrow("tool_resultに対応するtool_useが不足しています: toolu_123");
    });

    it("tool_useとtool_resultのIDが一致しない場合はエラーをスローすること", () => {
      const toolUseRequests: ClaudeToolUseRequestContent[] = [
        {
          type: "tool_use",
          id: "toolu_123",
          name: "web_search",
          input: { query: "test" },
        },
      ];

      const toolResults: ClaudeToolUseResultContent[] = [
        {
          type: "tool_result",
          tool_use_id: "toolu_456",
          content: '{"result": "found"}',
        },
      ];

      expect(() =>
        buildClaudeToolUseDataSet(toolUseRequests, toolResults),
      ).toThrow("tool_useに対応するtool_resultが不足しています: toolu_123");
    });

    it("複数のtool_useに対して一部のtool_resultが不足している場合はエラーをスローすること", () => {
      const toolUseRequests: ClaudeToolUseRequestContent[] = [
        {
          type: "tool_use",
          id: "toolu_123",
          name: "web_search",
          input: { query: "test1" },
        },
        {
          type: "tool_use",
          id: "toolu_456",
          name: "slack_getThreadMessages",
          input: { channelId: "C123", threadTs: "1234567890.123456" },
        },
      ];

      const toolResults: ClaudeToolUseResultContent[] = [
        {
          type: "tool_result",
          tool_use_id: "toolu_123",
          content: '{"result": "found1"}',
        },
      ];

      expect(() =>
        buildClaudeToolUseDataSet(toolUseRequests, toolResults),
      ).toThrow("tool_useに対応するtool_resultが不足しています: toolu_456");
    });
  });
});
