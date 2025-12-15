import { makeSlackApiClient } from "@platforms/slack/infrastructure/http/slackApiClient";
import { makeSlackFileApiClient } from "@platforms/slack/infrastructure/http/slackApiClient";
import { makeSlackRepository } from "@platforms/slack/infrastructure/repositories/slackRepository";

// モジュールをモック化
jest.mock("@platforms/slack/infrastructure/http/slackApiClient");

describe("slackRepository", () => {
  const mockApiClient = {
    baseUrl: "https://slack.com/api",
    headers: {},
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };

  const mockFileApiClient = {
    baseUrl: "https://files.slack.com",
    headers: {},
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };

  beforeEach(() => {
    (makeSlackApiClient as jest.Mock).mockReturnValue(mockApiClient);
    (makeSlackFileApiClient as jest.Mock).mockReturnValue(mockFileApiClient);
    jest.clearAllMocks();
  });

  describe("getChannels", () => {
    it("チャンネル一覧を取得できること", async () => {
      const mockResponse = {
        channels: [
          {
            id: "C1234567890",
            name: "general",
            is_channel: true,
            is_member: true,
          },
          {
            id: "C0987654321",
            name: "random",
            is_channel: true,
            is_member: true,
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getChannels();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/conversations.list",
        undefined,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.channels).toHaveLength(2);
    });

    it("クエリパラメータを指定してチャンネル一覧を取得できること", async () => {
      const mockResponse = {
        channels: [
          {
            id: "C1234567890",
            name: "general",
            is_channel: true,
            is_member: true,
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getChannels("limit=10");

      expect(mockApiClient.get).toHaveBeenCalledWith("/conversations.list", {
        limit: "10",
      });
      expect(result.isSuccess).toBe(true);
    });
  });

  describe("getConversationHistory", () => {
    it("会話履歴を取得できること", async () => {
      const mockResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "テストメッセージ1",
            user: "U1234567890",
            ts: "1234567890.123456",
          },
          {
            type: "message",
            text: "テストメッセージ2",
            user: "U0987654321",
            ts: "1234567891.123456",
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getConversationHistory("C1234567890");

      expect(mockApiClient.get).toHaveBeenCalledWith("/conversations.history", {
        channel: "C1234567890",
      });
      expect(result.isSuccess).toBe(true);
      expect(result.payload.messages).toHaveLength(2);
    });

    it("クエリパラメータを指定して会話履歴を取得できること", async () => {
      const mockResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "テストメッセージ",
            user: "U1234567890",
            ts: "1234567890.123456",
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getConversationHistory(
        "C1234567890",
        "limit=10",
      );

      expect(mockApiClient.get).toHaveBeenCalledWith("/conversations.history", {
        channel: "C1234567890",
        limit: "10",
      });
      expect(result.isSuccess).toBe(true);
    });
  });

  describe("getFileInfo", () => {
    it("ファイル情報を取得できること", async () => {
      const mockResponse = {
        ok: true,
        file: {
          id: "F1234567890",
          name: "test.png",
          mimetype: "image/png",
          size: 12345,
        },
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getFileInfo("F1234567890");

      expect(mockApiClient.get).toHaveBeenCalledWith("/files.info", {
        file: "F1234567890",
      });
      expect(result.isSuccess).toBe(true);
      expect(result.payload.file.id).toBe("F1234567890");
    });
  });

  describe("downloadFile", () => {
    it("ファイルをダウンロードしてBase64エンコードできること", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        data: mockArrayBuffer,
        status: 200,
        statusText: "OK",
        headers: {
          "content-type": "image/png",
        },
        config: {},
      };

      mockFileApiClient.get.mockResolvedValue(mockResponse);

      const repository = makeSlackRepository();
      const result = await repository.downloadFile(
        "/files-pri/T025DB6EA-F09GVMCG5E3/download/test.png",
      );

      expect(mockFileApiClient.get).toHaveBeenCalledWith(
        "/files-pri/T025DB6EA-F09GVMCG5E3/download/test.png",
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.mimetype).toBe("image/png");
      expect(result.payload.size).toBe(8);
      expect(result.payload.content).toBeDefined();
    });

    it("content-typeがない場合はデフォルトのmimetypeを使用すること", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockResponse = {
        data: mockArrayBuffer,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      };

      mockFileApiClient.get.mockResolvedValue(mockResponse);

      const repository = makeSlackRepository();
      const result = await repository.downloadFile("/files-pri/test.bin");

      expect(result.isSuccess).toBe(true);
      expect(result.payload.mimetype).toBe("application/octet-stream");
    });
  });

  describe("postMessage", () => {
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

      mockApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.postMessage(
        "C1234567890",
        "テストメッセージ",
      );

      expect(mockApiClient.post).toHaveBeenCalledWith("/chat.postMessage", {
        channel: "C1234567890",
        text: "テストメッセージ",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toEqual(mockResponse);
    });

    it("カスタムユーザー名とアイコンを含むメッセージ投稿が正常に動作すること", async () => {
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

      mockApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.postMessage(
        "C1234567890",
        "カスタムメッセージ",
        {
          username: "Custom Bot",
          icon_emoji: ":robot_face:",
          icon_url: undefined,
        },
      );

      expect(mockApiClient.post).toHaveBeenCalledWith("/chat.postMessage", {
        channel: "C1234567890",
        text: "カスタムメッセージ",
        username: "Custom Bot",
        icon_emoji: ":robot_face:",
        icon_url: undefined,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toEqual(mockResponse);
    });

    it("iconUrlのみが指定された場合のメッセージ投稿が正常に動作すること", async () => {
      const mockResponse = {
        ok: true,
        channel: "C1234567890",
        ts: "1234567890.123456",
        message: {
          text: "URLアイコンメッセージ",
          user: "U1234567890",
          type: "message",
          ts: "1234567890.123456",
        },
      };

      mockApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.postMessage(
        "C1234567890",
        "URLアイコンメッセージ",
        {
          username: undefined,
          icon_emoji: undefined,
          icon_url: "https://example.com/icon.png",
        },
      );

      expect(mockApiClient.post).toHaveBeenCalledWith("/chat.postMessage", {
        channel: "C1234567890",
        text: "URLアイコンメッセージ",
        username: undefined,
        icon_emoji: undefined,
        icon_url: "https://example.com/icon.png",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toEqual(mockResponse);
    });

    it("すべてのオプションが指定された場合のメッセージ投稿が正常に動作すること", async () => {
      const mockResponse = {
        ok: true,
        channel: "C1234567890",
        ts: "1234567890.123456",
        message: {
          text: "フルオプションメッセージ",
          username: "Full Bot",
          icons: { emoji: ":fire:" },
          user: "U1234567890",
          type: "message",
          ts: "1234567890.123456",
        },
      };

      mockApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.postMessage(
        "C1234567890",
        "フルオプションメッセージ",
        {
          username: "Full Bot",
          icon_emoji: ":fire:",
          icon_url: "https://example.com/icon.png",
        },
      );

      expect(mockApiClient.post).toHaveBeenCalledWith("/chat.postMessage", {
        channel: "C1234567890",
        text: "フルオプションメッセージ",
        username: "Full Bot",
        icon_emoji: ":fire:",
        icon_url: "https://example.com/icon.png",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toEqual(mockResponse);
    });

    it("APIエラーが発生した場合にエラーハンドリングが正常に動作すること", async () => {
      const mockError = {
        response: {
          data: { ok: false, error: "channel_not_found" },
          status: 404,
          statusText: "Not Found",
          headers: {},
          config: {},
        },
      };

      mockApiClient.post.mockRejectedValue(mockError);

      const repository = makeSlackRepository();
      const result = await repository.postMessage(
        "C1234567890",
        "エラーテスト",
      );

      expect(result.isSuccess).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe("getThreadMessages", () => {
    it("メッセージURLからスレッドメッセージを取得できること", async () => {
      const mockResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "親メッセージ",
            user: "U1234567890",
            ts: "1760259631.615889",
            thread_ts: "1760259631.615889",
          },
          {
            type: "message",
            text: "返信1",
            user: "U0987654321",
            ts: "1760259632.123456",
            thread_ts: "1760259631.615889",
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getThreadMessages(
        "/archives/C09L24UTM8A/p1760259631615889",
      );

      expect(mockApiClient.get).toHaveBeenCalledWith("/conversations.replies", {
        channel: "C09L24UTM8A",
        ts: "1760259631.615889",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.payload.messages).toHaveLength(2);
    });

    it("フルURLでもスレッドメッセージを取得できること", async () => {
      const mockResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "親メッセージ",
            user: "U1234567890",
            ts: "1760259631.615889",
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getThreadMessages(
        "https://openlogi.slack.com/archives/C09L24UTM8A/p1760259631615889",
      );

      expect(mockApiClient.get).toHaveBeenCalledWith("/conversations.replies", {
        channel: "C09L24UTM8A",
        ts: "1760259631.615889",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.payload.messages).toHaveLength(1);
    });

    it("不正なURL形式の場合にエラーが返されること", async () => {
      const repository = makeSlackRepository();
      const result = await repository.getThreadMessages("invalid-url");

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Invalid Slack message URL format");
    });
  });

  describe("getMessagesWithReaction", () => {
    it("特定のリアクションが押されているメッセージを取得できること", async () => {
      const mockResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "リアクション付きメッセージ",
            user: "U1234567890",
            ts: "1234567890.123456",
            reactions: [
              {
                name: "thumbsup",
                users: ["U0987654321"],
                count: 1,
              },
            ],
          },
          {
            type: "message",
            text: "リアクションなしメッセージ",
            user: "U1234567890",
            ts: "1234567891.123456",
          },
          {
            type: "message",
            text: "別のリアクション",
            user: "U1234567890",
            ts: "1234567892.123456",
            reactions: [
              {
                name: "eyes",
                users: ["U0987654321"],
                count: 1,
              },
            ],
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getMessagesWithReaction(
        "C1234567890",
        "thumbsup",
      );

      expect(mockApiClient.get).toHaveBeenCalledWith("/conversations.history", {
        channel: "C1234567890",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.payload.messages).toHaveLength(1);
      expect(result.payload.messages[0]!.text).toBe(
        "リアクション付きメッセージ",
      );
    });

    it("limitパラメータを指定してリアクション付きメッセージを取得できること", async () => {
      const mockResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "リアクション付き",
            user: "U1234567890",
            ts: "1234567890.123456",
            reactions: [
              {
                name: "white_check_mark",
                users: ["U0987654321"],
                count: 1,
              },
            ],
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getMessagesWithReaction(
        "C1234567890",
        "white_check_mark",
        "limit=100",
      );

      expect(mockApiClient.get).toHaveBeenCalledWith("/conversations.history", {
        channel: "C1234567890",
        limit: "100",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.payload.messages).toHaveLength(1);
    });

    it("スレッド内の返信もチェックしてリアクション付きメッセージを取得できること", async () => {
      const mockHistoryResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "親メッセージ",
            user: "U1234567890",
            ts: "1234567890.123456",
            thread_ts: "1234567890.123456",
            reply_count: 2,
          },
        ],
      };

      const mockThreadResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "親メッセージ",
            user: "U1234567890",
            ts: "1234567890.123456",
            thread_ts: "1234567890.123456",
          },
          {
            type: "message",
            text: "返信1",
            user: "U0987654321",
            ts: "1234567891.123456",
            thread_ts: "1234567890.123456",
            reactions: [
              {
                name: "kami_hatena",
                users: ["U1111111111"],
                count: 1,
              },
            ],
          },
          {
            type: "message",
            text: "返信2",
            user: "U0987654321",
            ts: "1234567892.123456",
            thread_ts: "1234567890.123456",
          },
        ],
      };

      mockApiClient.get
        .mockResolvedValueOnce({
          data: mockHistoryResponse,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        })
        .mockResolvedValueOnce({
          data: mockThreadResponse,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        });

      const repository = makeSlackRepository();
      const result = await repository.getMessagesWithReaction(
        "C1234567890",
        "kami_hatena",
      );

      expect(mockApiClient.get).toHaveBeenNthCalledWith(
        1,
        "/conversations.history",
        {
          channel: "C1234567890",
        },
      );
      expect(mockApiClient.get).toHaveBeenNthCalledWith(
        2,
        "/conversations.replies",
        {
          channel: "C1234567890",
          ts: "1234567890.123456",
        },
      );

      expect(result.isSuccess).toBe(true);
      expect(result.payload.messages).toHaveLength(1);
      expect(result.payload.messages[0]!.text).toBe("返信1");
    });

    it("リアクションが押されているメッセージがない場合は空の配列を返すこと", async () => {
      const mockResponse = {
        ok: true,
        messages: [
          {
            type: "message",
            text: "リアクションなし",
            user: "U1234567890",
            ts: "1234567890.123456",
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const repository = makeSlackRepository();
      const result = await repository.getMessagesWithReaction(
        "C1234567890",
        "thumbsup",
      );

      expect(result.isSuccess).toBe(true);
      expect(result.payload.messages).toHaveLength(0);
    });
  });
});
