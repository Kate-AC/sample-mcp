import { loadRedashEnv } from "@platforms/redash/infrastructure/env/redashEnv";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("redashEnv", () => {
  describe("loadRedashEnv", () => {
    it("正しい環境変数オブジェクトを返すこと", () => {
      (getEnv as jest.Mock).mockReturnValue("test-api-key");

      const env = loadRedashEnv();

      expect(env).toBeDefined();
      expect(env.apiKey).toBe("test-api-key");
    });

    it("apiKeyが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock).mockReturnValue("");

      expect(() => {
        loadRedashEnv();
      }).toThrow("Redash apiKey is required");
    });
  });
});
