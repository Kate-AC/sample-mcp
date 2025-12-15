import { loadGoogleConfig } from "@platforms/google/domain/settings/googleConfig";

describe("googleConfig", () => {
  describe("loadGoogleConfig", () => {
    it("正しい設定オブジェクトを返すこと", () => {
      const config = loadGoogleConfig();

      expect(config).toBeDefined();
      expect(config.baseUrl).toBe("https://www.googleapis.com");
      expect(config.docsBaseUrl).toBe("https://docs.googleapis.com/v1");
      expect(config.redirectUri).toBe("http://localhost:8080/oauth2callback");
      expect(config.accessTokenFilePath).toContain("google_access_token.txt");
    });

    it("accessTokenFilePathにホームディレクトリが含まれること", () => {
      const config = loadGoogleConfig();

      expect(config.accessTokenFilePath).toContain(".cache");
      expect(config.accessTokenFilePath).toContain("sample-mcp-kit");
    });
  });
});
