import { loadRedmineEnv } from "@platforms/redmine/infrastructure/env/redmineEnv";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("redmineEnv", () => {
  describe("loadRedmineEnv", () => {
    it("正しい環境変数オブジェクトを返すこと", () => {
      (getEnv as jest.Mock).mockReturnValue("test-api-key");

      const env = loadRedmineEnv();

      expect(env).toBeDefined();
      expect(env.apiKey).toBe("test-api-key");
    });

    it("apiKeyが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock).mockReturnValue("");

      expect(() => {
        loadRedmineEnv();
      }).toThrow("Redmine apiKey is required");
    });
  });
});
