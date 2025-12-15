import { makeGoogleMcpSetting } from "@platforms/google/adapter/googleMcpSetting";
import { loadGoogleConfig } from "@platforms/google/domain/settings/googleConfig";
import { loadGoogleEnv } from "@platforms/google/infrastructure/env/googleEnv";

// モジュールをモック化
jest.mock("@platforms/google/domain/settings/googleConfig");
jest.mock("@platforms/google/infrastructure/env/googleEnv");

describe("googleMcpSetting", () => {
  describe("makeGoogleMcpSetting", () => {
    it("設定オブジェクトを正しく作成できること", () => {
      const setting = makeGoogleMcpSetting();

      expect(setting).toBeDefined();
      expect(setting.getConfig).toBeDefined();
      expect(setting.getEnv).toBeDefined();
    });

    it("getConfigがloadGoogleConfigを呼び出すこと", async () => {
      const mockConfig = {
        baseUrl: "https://www.googleapis.com",
        redirectUri: "http://localhost:8080/oauth2callback",
      };
      (loadGoogleConfig as jest.Mock).mockReturnValue(mockConfig);

      const setting = makeGoogleMcpSetting();
      const config = await setting.getConfig();

      expect(loadGoogleConfig).toHaveBeenCalled();
      expect(config).toEqual(mockConfig);
    });

    it("getEnvがloadGoogleEnvを呼び出すこと", async () => {
      const mockEnv = {
        accessToken: "test-access-token",
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        token: {},
      };
      (loadGoogleEnv as jest.Mock).mockReturnValue(mockEnv);

      const setting = makeGoogleMcpSetting();
      const env = await setting.getEnv();

      expect(loadGoogleEnv).toHaveBeenCalled();
      expect(env).toEqual(mockEnv);
    });
  });
});
