import { loadFigmaEnv } from "@platforms/figma/infrastructure/env/figmaEnv";

describe("figmaEnv", () => {
  it("FIGMA_API_TOKENが設定されている場合に取得できること", () => {
    process.env["FIGMA_API_TOKEN"] = "figd_test_token";

    const env = loadFigmaEnv();
    expect(env.apiToken).toBe("figd_test_token");

    delete process.env["FIGMA_API_TOKEN"];
  });

  it("FIGMA_API_TOKENが未設定の場合にエラーを投げること", () => {
    delete process.env["FIGMA_API_TOKEN"];

    expect(() => loadFigmaEnv()).toThrow(
      "Environment variable FIGMA_API_TOKEN is not defined",
    );
  });
});
