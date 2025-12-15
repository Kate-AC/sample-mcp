import { loadTitanConfig } from "@aiModels/titan/domain/settings/titanConfig";
import { makeTitanRepository } from "@aiModels/titan/infrastructure/repositories/titanRepository";

jest.mock("@aiModels/titan/domain/settings/titanConfig");
jest.mock("@aiModels/titan/infrastructure/http/titanApiClient");

describe("titanRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeTitanRepository", () => {
    it("リポジトリを作成できること", () => {
      const mockConfig = {
        defaultModel: "amazon.titan-text-express-v1",
        defaultMaxTokens: 4096,
        defaultTemperature: 0.7,
        defaultTopP: 0.9,
        defaultStopSequences: [],
        defaultAwsProfile: "default",
        defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
      };
      (loadTitanConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockApiClient = {
        send: jest.fn(),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeTitanRepository(mockApiClientFactory, mockConfig);

      expect(repository).toBeDefined();
      expect(repository.ask).toBeDefined();
      expect(typeof repository.ask).toBe("function");
      expect(repository.askJson).toBeDefined();
      expect(typeof repository.askJson).toBe("function");
      expect(repository.embed).toBeDefined();
      expect(typeof repository.embed).toBe("function");
      expect(repository.embedBatch).toBeDefined();
      expect(typeof repository.embedBatch).toBe("function");
    });

    it("askメソッドがAPI呼び出しを行うこと", async () => {
      const mockConfig = {
        defaultModel: "amazon.titan-text-express-v1",
        defaultMaxTokens: 4096,
        defaultTemperature: 0.7,
        defaultTopP: 0.9,
        defaultStopSequences: [],
        defaultAwsProfile: "default",
        defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
      };
      (loadTitanConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockBedrockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            results: [
              {
                outputText: "こんにちは！",
                completionReason: "FINISH",
                inputTokenCount: 5,
                outputTokenCount: 8,
              },
            ],
          }),
        ),
      };

      const mockApiClient = {
        send: jest.fn().mockResolvedValue(mockBedrockResponse),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeTitanRepository(mockApiClientFactory, mockConfig);
      const result = await repository.ask([
        { role: "user", content: "こんにちは" },
      ]);

      expect(result.isSuccess).toBe(true);
      expect(mockApiClient.send).toHaveBeenCalled();
    });

    it("askメソッドで空配列を渡すとエラーになること", async () => {
      const mockConfig = {
        defaultModel: "amazon.titan-text-express-v1",
        defaultMaxTokens: 4096,
        defaultTemperature: 0.7,
        defaultTopP: 0.9,
        defaultStopSequences: [],
        defaultAwsProfile: "default",
        defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
      };
      (loadTitanConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockApiClient = {
        send: jest.fn(),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeTitanRepository(mockApiClientFactory, mockConfig);
      const result = await repository.ask([]);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Messages array cannot be empty");
    });

    it("最後のユーザーメッセージのみを使用すること", async () => {
      const mockConfig = {
        defaultModel: "amazon.titan-text-express-v1",
        defaultMaxTokens: 4096,
        defaultTemperature: 0.7,
        defaultTopP: 0.9,
        defaultStopSequences: [],
        defaultAwsProfile: "default",
        defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
      };
      (loadTitanConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockBedrockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            results: [
              {
                outputText: "最新のメッセージに対する応答",
                completionReason: "FINISH",
                inputTokenCount: 10,
                outputTokenCount: 15,
              },
            ],
          }),
        ),
      };

      const mockApiClient = {
        send: jest.fn().mockResolvedValue(mockBedrockResponse),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeTitanRepository(mockApiClientFactory, mockConfig);
      await repository.ask([
        { role: "user", content: "最初のメッセージ" },
        { role: "assistant", content: "応答1" },
        { role: "user", content: "最後のメッセージ" },
      ]);

      expect(mockApiClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            body: expect.stringContaining("最後のメッセージ"),
          }),
        }),
      );
    });

    it("askJsonメソッドがJSON形式で応答を返すこと", async () => {
      const mockConfig = {
        defaultModel: "amazon.titan-text-express-v1",
        defaultMaxTokens: 4096,
        defaultTemperature: 0.7,
        defaultTopP: 0.9,
        defaultStopSequences: [],
        defaultAwsProfile: "default",
        defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
      };
      (loadTitanConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockBedrockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            results: [
              {
                outputText:
                  '```json\n{"answer":"テスト回答","additional_links":[],"additional_commands":[],"additional_infos":[]}\n```',
                completionReason: "FINISH",
                inputTokenCount: 10,
                outputTokenCount: 20,
              },
            ],
          }),
        ),
      };

      const mockApiClient = {
        send: jest.fn().mockResolvedValue(mockBedrockResponse),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeTitanRepository(mockApiClientFactory, mockConfig);
      const result = await repository.askJson([
        { role: "user", content: "テスト質問" },
      ]);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.payload.answer).toBe("テスト回答");
        expect(result.payload.additional_links).toEqual([]);
      }
    });

    it("askJsonメソッドでJSONパースエラーが発生した場合にエラーを返すこと", async () => {
      const mockConfig = {
        defaultModel: "amazon.titan-text-express-v1",
        defaultMaxTokens: 4096,
        defaultTemperature: 0.7,
        defaultTopP: 0.9,
        defaultStopSequences: [],
        defaultAwsProfile: "default",
        defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
      };
      (loadTitanConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockBedrockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            results: [
              {
                outputText: "これは不正なJSON形式です",
                completionReason: "FINISH",
                inputTokenCount: 5,
                outputTokenCount: 10,
              },
            ],
          }),
        ),
      };

      const mockApiClient = {
        send: jest.fn().mockResolvedValue(mockBedrockResponse),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeTitanRepository(mockApiClientFactory, mockConfig);
      const result = await repository.askJson([
        { role: "user", content: "テスト質問" },
      ]);

      expect(result.isSuccess).toBe(false);
      // safeCallがJSON.parse()のエラーをキャッチする
      expect(result.message).toContain("Unexpected token");
    });

    it("embedメソッドがベクトルを返すこと", async () => {
      const mockConfig = {
        defaultModel: "amazon.titan-text-express-v1",
        defaultMaxTokens: 4096,
        defaultTemperature: 0.7,
        defaultTopP: 0.9,
        defaultStopSequences: [],
        defaultAwsProfile: "default",
        defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
      };
      (loadTitanConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockEmbeddingResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
            inputTextTokenCount: 5,
          }),
        ),
      };

      const mockApiClient = {
        send: jest.fn().mockResolvedValue(mockEmbeddingResponse),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeTitanRepository(mockApiClientFactory, mockConfig);
      const result = await repository.embed("テストテキスト");

      expect(result).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
      expect(mockApiClient.send).toHaveBeenCalled();
    });

    it("embedBatchメソッドが複数のベクトルを返すこと", async () => {
      const mockConfig = {
        defaultModel: "amazon.titan-text-express-v1",
        defaultMaxTokens: 4096,
        defaultTemperature: 0.7,
        defaultTopP: 0.9,
        defaultStopSequences: [],
        defaultAwsProfile: "default",
        defaultEmbeddingsModel: "amazon.titan-embed-text-v2:0",
      };
      (loadTitanConfig as jest.Mock).mockReturnValue(mockConfig);

      const mockEmbeddingResponse1 = {
        body: new TextEncoder().encode(
          JSON.stringify({
            embedding: [0.1, 0.2, 0.3],
            inputTextTokenCount: 3,
          }),
        ),
      };

      const mockEmbeddingResponse2 = {
        body: new TextEncoder().encode(
          JSON.stringify({
            embedding: [0.4, 0.5, 0.6],
            inputTextTokenCount: 3,
          }),
        ),
      };

      const mockApiClient = {
        send: jest
          .fn()
          .mockResolvedValueOnce(mockEmbeddingResponse1)
          .mockResolvedValueOnce(mockEmbeddingResponse2),
      };
      const mockApiClientFactory = jest.fn().mockReturnValue(mockApiClient);

      const repository = makeTitanRepository(mockApiClientFactory, mockConfig);
      const result = await repository.embedBatch(["テキスト1", "テキスト2"]);

      expect(result).toEqual([
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ]);
      expect(mockApiClient.send).toHaveBeenCalledTimes(2);
    });
  });
});
