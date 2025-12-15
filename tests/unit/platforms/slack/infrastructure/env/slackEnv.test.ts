import { loadSlackEnv } from "@platforms/slack/infrastructure/env/slackEnv";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("slackEnv", () => {
  describe("loadSlackEnv", () => {
    it("正しい環境変数オブジェクトを返すこと", () => {
      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "SLACK_USER_OAUTH_TOKEN") return "test-user-token";
        if (key === "SLACK_BOT_USER_OAUTH_TOKEN") return "test-bot-token";
        if (key === "SLACK_BOT_USER_NAME") return "test-bot-name";
        return "";
      });

      const env = loadSlackEnv();

      expect(env).toBeDefined();
      expect(env.userOAuthToken).toBe("test-user-token");
      expect(env.botUserOAuthToken).toBe("test-bot-token");
      expect(env.botUserName).toBe("test-bot-name");
    });

    it("userOAuthTokenが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "SLACK_USER_OAUTH_TOKEN") return "";
        if (key === "SLACK_BOT_USER_OAUTH_TOKEN") return "test-bot-token";
        if (key === "SLACK_BOT_USER_NAME") return "test-bot-name";
        return "";
      });

      expect(() => {
        loadSlackEnv();
      }).toThrow("Slack userOAuthToken is required");
    });

    it("botUserOAuthTokenが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "SLACK_USER_OAUTH_TOKEN") return "test-user-token";
        if (key === "SLACK_BOT_USER_OAUTH_TOKEN") return "";
        if (key === "SLACK_BOT_USER_NAME") return "test-bot-name";
        return "";
      });

      expect(() => {
        loadSlackEnv();
      }).toThrow("Slack botUserOAuthToken is required");
    });

    it("botUserNameが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "SLACK_USER_OAUTH_TOKEN") return "test-user-token";
        if (key === "SLACK_BOT_USER_OAUTH_TOKEN") return "test-bot-token";
        if (key === "SLACK_BOT_USER_NAME") return "";
        return "";
      });

      expect(() => {
        loadSlackEnv();
      }).toThrow("Slack botUserName is required");
    });
  });
});
