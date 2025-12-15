import { loadPlaywrightEnv } from "@platforms/playwright/infrastructure/env/playwrightEnv";

describe("playwrightEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("デフォルト値でロードできること", () => {
    delete process.env["PLAYWRIGHT_MCP_BASE_URL"];
    const env = loadPlaywrightEnv();
    expect(env.baseUrl).toBe("http://localhost:8931");
  });

  it("環境変数が設定されている場合はその値を使うこと", () => {
    process.env["PLAYWRIGHT_MCP_BASE_URL"] = "http://custom-host:9999";
    const env = loadPlaywrightEnv();
    expect(env.baseUrl).toBe("http://custom-host:9999");
  });
});
