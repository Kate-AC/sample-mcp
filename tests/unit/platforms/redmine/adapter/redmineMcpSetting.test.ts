import { makeRedmineMcpSetting } from "@platforms/redmine/adapter/redmineMcpSetting";
import { loadRedmineConfig } from "@platforms/redmine/domain/settings/redmineConfig";
import { loadRedmineEnv } from "@platforms/redmine/infrastructure/env/redmineEnv";

jest.mock("@platforms/redmine/domain/settings/redmineConfig");
jest.mock("@platforms/redmine/infrastructure/env/redmineEnv");

describe("redmineMcpSetting", () => {
  it("設定を取得できること", async () => {
    (loadRedmineConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://redmine.openlogi.com",
    });
    (loadRedmineEnv as jest.Mock).mockReturnValue({ apiKey: "test-key" });

    const setting = makeRedmineMcpSetting();
    const config = await setting.getConfig();
    expect(config.baseUrl).toBe("https://redmine.openlogi.com");
  });
});
