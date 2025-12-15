import { makePlaywrightMcpSetting } from "@platforms/playwright/adapter/playwrightMcpSetting";
import { loadPlaywrightEnv } from "@platforms/playwright/infrastructure/env/playwrightEnv";

jest.mock("@platforms/playwright/infrastructure/env/playwrightEnv");

describe("playwrightMcpSetting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("設定を取得できること", async () => {
    const setting = makePlaywrightMcpSetting();
    const config = await setting.getConfig();
    expect(config).toEqual({});
  });

  it("環境変数を取得できること", async () => {
    (loadPlaywrightEnv as jest.Mock).mockReturnValue({
      baseUrl: "http://localhost:8931",
    });

    const setting = makePlaywrightMcpSetting();
    const env = await setting.getEnv();
    expect(env.baseUrl).toBe("http://localhost:8931");
  });
});
