import { loadClaudeConfig } from "@aiModels/claude/domain/settings/claudeConfig";
import { makeClaudeRepository } from "@aiModels/claude/infrastructure/repositories/claudeRepository";

jest.mock("@aiModels/claude/domain/settings/claudeConfig");
jest.mock("@aiModels/claude/infrastructure/http/claudeApiClient");

describe("claudeRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeClaudeRepository", () => {
    it("リポジトリを作成できること", () => {
      const mockConfig = {
        defaultModel: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        defaultMaxTokens: 4096,
        defaultVersion: "bedrock-2023-05-31",
        defaultAwsProfile: "dev-admin",
      };
      (loadClaudeConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockApiClient = {
        send: jest.fn(),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeClaudeRepository(mockApiClientFactory, mockConfig);

      expect(repository).toBeDefined();
      expect(repository.ask).toBeDefined();
      expect(typeof repository.ask).toBe("function");
      expect(repository.askJson).toBeDefined();
      expect(typeof repository.askJson).toBe("function");
    });

    it("askメソッドがAPI呼び出しを行うこと", async () => {
      const mockConfig = {
        defaultModel: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        defaultMaxTokens: 4096,
        defaultVersion: "bedrock-2023-05-31",
        defaultAwsProfile: "dev-admin",
      };
      (loadClaudeConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockBedrockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            id: "msg-123",
            type: "message",
            role: "assistant",
            content: [{ type: "text", text: "Hello!" }],
            model: "claude-3-5-sonnet-20240620",
            stop_reason: "end_turn",
            usage: {
              input_tokens: 10,
              output_tokens: 5,
            },
          }),
        ),
      };

      const mockApiClient = {
        send: jest.fn().mockResolvedValue(mockBedrockResponse),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeClaudeRepository(mockApiClientFactory, mockConfig);
      const result = await repository.ask([{ role: "user", content: "Hello" }]);

      expect(result.isSuccess).toBe(true);
      expect(mockApiClient.send).toHaveBeenCalled();
    });

    it("askメソッドで空配列を渡すとエラーになること", async () => {
      const mockConfig = {
        defaultModel: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        defaultMaxTokens: 4096,
        defaultVersion: "bedrock-2023-05-31",
        defaultAwsProfile: "dev-admin",
      };
      (loadClaudeConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockApiClient = {
        send: jest.fn(),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeClaudeRepository(mockApiClientFactory, mockConfig);
      const result = await repository.ask([]);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Messages array cannot be empty");
    });
  });

  describe("askJson", () => {
    it("askJsonメソッドが正しく動作すること", async () => {
      const mockConfig = {
        defaultModel: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        defaultMaxTokens: 4096,
        defaultVersion: "bedrock-2023-05-31",
        defaultAwsProfile: "dev-admin",
      };
      (loadClaudeConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockBedrockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            id: "msg-123",
            type: "message",
            role: "assistant",
            content: [
              {
                type: "text",
                text: '```json\n{"answer":"テスト回答","additional_links":[],"additional_commands":[],"additional_infos":[]}\n```',
              },
            ],
            model: "claude-3-5-sonnet-20240620",
            stop_reason: "end_turn",
            usage: {
              input_tokens: 50,
              output_tokens: 30,
            },
          }),
        ),
      };

      const mockApiClient = {
        send: jest.fn().mockResolvedValue(mockBedrockResponse),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeClaudeRepository(mockApiClientFactory, mockConfig);
      const result = await repository.askJson([
        { role: "user", content: "Test" },
      ]);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toHaveProperty("answer");
      expect(result.payload.answer).toBe("テスト回答");
    });

    it("askJsonメソッドで空配列を渡すとエラーになること", async () => {
      const mockConfig = {
        defaultModel: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        defaultMaxTokens: 4096,
        defaultVersion: "bedrock-2023-05-31",
        defaultAwsProfile: "dev-admin",
      };
      (loadClaudeConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockApiClient = {
        send: jest.fn(),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeClaudeRepository(mockApiClientFactory, mockConfig);
      const result = await repository.askJson([]);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Messages array cannot be empty");
    });

    it("askJsonメソッドでJSONパースエラーが発生した場合にエラーになること", async () => {
      const mockConfig = {
        defaultModel: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        defaultMaxTokens: 4096,
        defaultVersion: "bedrock-2023-05-31",
        defaultAwsProfile: "dev-admin",
      };
      (loadClaudeConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockBedrockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            id: "msg-123",
            type: "message",
            role: "assistant",
            content: [{ type: "text", text: "Invalid JSON response" }],
            model: "claude-3-5-sonnet-20240620",
            stop_reason: "end_turn",
            usage: {
              input_tokens: 50,
              output_tokens: 30,
            },
          }),
        ),
      };

      const mockApiClient = {
        send: jest.fn().mockResolvedValue(mockBedrockResponse),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeClaudeRepository(mockApiClientFactory, mockConfig);
      const result = await repository.askJson([
        { role: "user", content: "Test" },
      ]);

      expect(result.isSuccess).toBe(false);
      // safeCallがJSON.parse()のエラーをキャッチする
      expect(result.message).toContain("Unexpected token");
    });
  });
});
