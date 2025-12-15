import { makeSlackMcpSetting } from "@platforms/slack/adapter/slackMcpSetting";
import { loadSlackConfig } from "@platforms/slack/domain/settings/slackConfig";
import { loadSlackEnv } from "@platforms/slack/infrastructure/env/slackEnv";

jest.mock("@platforms/slack/domain/settings/slackConfig");
jest.mock("@platforms/slack/infrastructure/env/slackEnv");

describe("slackMcpSetting", () => {
  it("設定を取得できること", async () => {
    (loadSlackConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://slack.com",
    });
    (loadSlackEnv as jest.Mock).mockReturnValue({
      userOAuthToken: "test-user-token",
      botUserOAuthToken: "test-bot-token",
    });

    const setting = makeSlackMcpSetting();
    const config = await setting.getConfig();
    expect(config.baseUrl).toBe("https://slack.com");
  });
});
