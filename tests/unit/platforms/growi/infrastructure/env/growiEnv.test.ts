import { loadGrowiEnv } from "@platforms/growi/infrastructure/env/growiEnv";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("growiEnv", () => {
  describe("loadGrowiEnv", () => {
    it("正しい環境変数オブジェクトを返すこと", () => {
      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "GROWI_API_TOKEN") return "test-token";
        if (key === "GROWI_COOKIE") return "test-cookie";
        return "";
      });

      const env = loadGrowiEnv();

      expect(env).toBeDefined();
      expect(env.apiToken).toBe("test-token");
      expect(env.cookie).toBe("test-cookie");
    });

    it("apiTokenとcookieの両方が空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock).mockImplementation(() => {
        return "";
      });

      expect(() => {
        loadGrowiEnv();
      }).toThrow("Growi apiToken or cookie is required");
    });

    it("apiTokenのみがある場合、正常に動作すること", () => {
      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "GROWI_API_TOKEN") return "test-token";
        return "";
      });

      const env = loadGrowiEnv();
      expect(env.apiToken).toBe("test-token");
    });

    it("cookieのみがある場合、正常に動作すること", () => {
      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "GROWI_COOKIE") return "test-cookie";
        return "";
      });

      const env = loadGrowiEnv();
      expect(env.cookie).toBe("test-cookie");
    });
  });
});
