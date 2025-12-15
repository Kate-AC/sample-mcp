import { makeRedashMcpSetting } from "@platforms/redash/adapter/redashMcpSetting";
import { loadRedashConfig } from "@platforms/redash/domain/settings/redashConfig";
import { loadRedashEnv } from "@platforms/redash/infrastructure/env/redashEnv";

jest.mock("@platforms/redash/domain/settings/redashConfig");
jest.mock("@platforms/redash/infrastructure/env/redashEnv");

describe("redashMcpSetting", () => {
  it("設定を取得できること", async () => {
    (loadRedashConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://redash.example.com",
    });
    (loadRedashEnv as jest.Mock).mockReturnValue({ apiKey: "test-key" });

    const setting = makeRedashMcpSetting();
    const config = await setting.getConfig();
    const env = await setting.getEnv();

    expect(config.baseUrl).toBe("https://redash.example.com");
    expect(env.apiKey).toBe("test-key");
  });
});
