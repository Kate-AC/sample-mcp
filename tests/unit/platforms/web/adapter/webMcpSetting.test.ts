import { makeWebMcpSetting } from "@platforms/web/adapter/webMcpSetting";

describe("webMcpSetting", () => {
  it("設定を正しく取得できること", async () => {
    const setting = makeWebMcpSetting();

    const config = await setting.getConfig();
    expect(config.timeout).toBe(30000);
    expect(config.maxImageSize).toBe(10 * 1024 * 1024);

    const env = await setting.getEnv();
    expect(env).toEqual({});
  });
});
