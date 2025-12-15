import { makePostSlackUseCase } from "@platforms/slack/application/usecases/postSlackUseCase";
import { SlackRepository } from "@platforms/slack/domain/repositories/slackRepository";
import { SlackEnv } from "@platforms/slack/infrastructure/env/slackEnv";

describe("postSlackUseCase", () => {
  const mockSlackRepository: jest.Mocked<SlackRepository> = {
    getChannels: jest.fn(),
    getConversationHistory: jest.fn(),
    getFileInfo: jest.fn(),
    downloadFile: jest.fn(),
    postMessage: jest.fn(),
    getThreadMessages: jest.fn(),
    getMessagesWithReaction: jest.fn(),
    searchMessages: jest.fn(),
  };

  const mockSlackRepositoryFactory = jest.fn(() => mockSlackRepository);
  const mockSlackEnv: SlackEnv = {
    userOAuthToken: "xoxp-test",
    botUserOAuthToken: "xoxb-test",
    botUserName: "Test Bot",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("invoke", () => {
    it("基本的なメッセージ投稿が正常に動作すること", async () => {
      const mockResponse = {
        ok: true,
        channel: "C1234567890",
        ts: "1234567890.123456",
        message: {
          text: "テストメッセージ",
          user: "U1234567890",
          type: "message",
          ts: "1234567890.123456",
        },
      };

      mockSlackRepository.postMessage.mockResolvedValue({
        isSuccess: true,
        payload: mockResponse,
        status: 200,
        message: "Success",
      });

      const useCase = makePostSlackUseCase({
        slackRepositoryFactory: mockSlackRepositoryFactory,
        slackEnv: mockSlackEnv,
      });

      const result = await useCase.invoke("C1234567890", "テストメッセージ");

      expect(mockSlackRepositoryFactory).toHaveBeenCalled();
      expect(mockSlackRepository.postMessage).toHaveBeenCalledWith(
        "C1234567890",
        "テストメッセージ",
        {
          username: "Test Bot",
        },
      );

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toEqual(mockResponse);
    });

    it("カスタムオプションを含むメッセージ投稿が正常に動作すること", async () => {
      const mockResponse = {
        ok: true,
        channel: "C1234567890",
        ts: "1234567890.123456",
        message: {
          text: "カスタムメッセージ",
          username: "Custom Bot",
          icons: { emoji: ":robot_face:" },
          user: "U1234567890",
          type: "message",
          ts: "1234567890.123456",
        },
      };

      const options = {
        username: "Custom Bot",
        iconEmoji: ":robot_face:",
        iconUrl: undefined,
      };

      mockSlackRepository.postMessage.mockResolvedValue({
        isSuccess: true,
        payload: mockResponse,
        status: 200,
        message: "Success",
      });

      const useCase = makePostSlackUseCase({
        slackRepositoryFactory: mockSlackRepositoryFactory,
        slackEnv: mockSlackEnv,
      });

      const result = await useCase.invoke(
        "C1234567890",
        "カスタムメッセージ",
        JSON.stringify(options),
      );

      expect(mockSlackRepository.postMessage).toHaveBeenCalledWith(
        "C1234567890",
        "カスタムメッセージ",
        {
          username: "Custom Bot",
          iconEmoji: ":robot_face:",
          iconUrl: undefined,
        },
      );

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toEqual(mockResponse);
    });

    it("リポジトリエラーが発生した場合にエラーハンドリングが正常に動作すること", async () => {
      const mockError = {
        isSuccess: false,
        payload: {} as any,
        status: 404,
        message: "channel_not_found",
      };

      mockSlackRepository.postMessage.mockResolvedValue(mockError);

      const useCase = makePostSlackUseCase({
        slackRepositoryFactory: mockSlackRepositoryFactory,
        slackEnv: mockSlackEnv,
      });

      const result = await useCase.invoke("C1234567890", "エラーテスト");

      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe("channel_not_found");
    });

    it("デフォルトのファクトリを使用した場合に正常に動作すること", async () => {
      const mockResponse = {
        ok: true,
        channel: "C1234567890",
        ts: "1234567890.123456",
        message: {
          text: "デフォルトファクトリテスト",
          user: "U1234567890",
          type: "message",
          ts: "1234567890.123456",
        },
      };

      // デフォルトファクトリをモック化
      const useCase = makePostSlackUseCase();

      // 実際のリポジトリが呼ばれることを確認するため、
      // モックされたリポジトリを返すように設定
      const mockRepo = {
        getChannels: jest.fn(),
        getConversationHistory: jest.fn(),
        getFileInfo: jest.fn(),
        downloadFile: jest.fn(),
        postMessage: jest.fn().mockResolvedValue({
          isSuccess: true,
          payload: mockResponse,
          status: 200,
          message: "Success",
        }),
      };

      // デフォルトファクトリをモック化
      jest
        .spyOn(
          require("@platforms/slack/infrastructure/repositories/slackRepository"),
          "makeSlackRepository",
        )
        .mockReturnValue(mockRepo);

      const result = await useCase.invoke(
        "C1234567890",
        "デフォルトファクトリテスト",
      );

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toEqual(mockResponse);
    });
  });
});
