import { loadSlackConfig } from "@platforms/slack/domain/settings/slackConfig";
import { loadSlackEnv } from "@platforms/slack/infrastructure/env/slackEnv";
import {
  makeSlackApiClient,
  makeSlackFileApiClient,
} from "@platforms/slack/infrastructure/http/slackApiClient";
import { makeApiClient } from "@infrastructure/shared/apiClient";

// モジュールをモック化
jest.mock("@infrastructure/shared/apiClient");
jest.mock("@platforms/slack/domain/settings/slackConfig");
jest.mock("@platforms/slack/infrastructure/env/slackEnv");

describe("slackApiClient", () => {
  beforeEach(() => {
    (loadSlackConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://slack.com",
      baseFileUrl: "https://files.slack.com",
    });
    (loadSlackEnv as jest.Mock).mockReturnValue({
      userOAuthToken: "test-user-token",
      botUserOAuthToken: "test-bot-token",
    });
  });

  describe("makeSlackApiClient", () => {
    it("ApiClientが返されること", () => {
      const mockApiClient = {
        baseUrl: "https://slack.com/api",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = makeSlackApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://slack.com/api",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-user-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });

  describe("makeSlackFileApiClient", () => {
    it("ファイルダウンロード用のApiClientが返されること", () => {
      const mockApiClient = {
        baseUrl: "https://files.slack.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = makeSlackFileApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://files.slack.com",
        expect.objectContaining({
          Authorization: "Bearer test-user-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });

    it("useUserToken=falseの場合、BotトークンでApiClientが作成されること", () => {
      const mockApiClient = {
        baseUrl: "https://files.slack.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = makeSlackFileApiClient(false);

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://files.slack.com",
        expect.objectContaining({
          Authorization: "Bearer test-bot-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });
});
