import { loadGrowiConfig } from "@platforms/growi/domain/settings/growiConfig";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("growiConfig", () => {
  describe("loadGrowiConfig", () => {
    it("正しい設定オブジェクトを返すこと", () => {
      (getEnv as jest.Mock).mockReturnValue("https://wiki.example.com");

      const config = loadGrowiConfig();

      expect(config).toBeDefined();
      expect(config.baseUrl).toBe("https://wiki.example.com");
    });
  });
});
