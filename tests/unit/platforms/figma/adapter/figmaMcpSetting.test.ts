import { makeFigmaMcpSetting } from "@platforms/figma/adapter/figmaMcpSetting";

describe("figmaMcpSetting", () => {
  it("設定を正しく取得できること", async () => {
    const setting = makeFigmaMcpSetting();

    const config = await setting.getConfig();
    expect(config.baseUrl).toBe("https://api.figma.com/v1");
  });

  it("環境変数を正しく取得できること", async () => {
    process.env["FIGMA_API_TOKEN"] = "test-token";

    const setting = makeFigmaMcpSetting();
    const env = await setting.getEnv();
    expect(env.apiToken).toBe("test-token");

    delete process.env["FIGMA_API_TOKEN"];
  });
});
