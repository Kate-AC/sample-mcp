import { loadGitHubEnv } from "@platforms/github/infrastructure/env/githubEnv";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("githubEnv", () => {
  describe("loadGitHubEnv", () => {
    it("正しい環境変数オブジェクトを返すこと", () => {
      (getEnv as jest.Mock).mockReturnValue("test-token-123");

      const env = loadGitHubEnv();

      expect(env).toBeDefined();
      expect(env.personalAccessToken).toBe("test-token-123");
    });

    it("personalAccessTokenが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock).mockReturnValue("");

      expect(() => {
        loadGitHubEnv();
      }).toThrow("GitHub personalAccessToken is required");
    });
  });
});
