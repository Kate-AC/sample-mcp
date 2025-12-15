import { loadGitHubConfig } from "@platforms/github/domain/settings/githubConfig";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("githubConfig", () => {
  describe("loadGitHubConfig", () => {
    it("正しい設定オブジェクトを返すこと", () => {
      (getEnv as jest.Mock).mockReturnValue("https://api.github.com");

      const config = loadGitHubConfig();

      expect(config).toBeDefined();
      expect(config.baseUrl).toBe("https://api.github.com");
    });

    it("デフォルト値が設定されること", () => {
      (getEnv as jest.Mock).mockImplementation(
        (_key: string, defaultValue?: string) => defaultValue,
      );

      const config = loadGitHubConfig();

      expect(config.baseUrl).toBe("https://api.github.com");
    });
  });
});
