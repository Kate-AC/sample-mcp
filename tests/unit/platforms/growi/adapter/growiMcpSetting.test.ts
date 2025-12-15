import { makeGrowiMcpSetting } from "@platforms/growi/adapter/growiMcpSetting";
import { loadGrowiConfig } from "@platforms/growi/domain/settings/growiConfig";
import { loadGrowiEnv } from "@platforms/growi/infrastructure/env/growiEnv";

// モジュールをモック化
jest.mock("@platforms/growi/domain/settings/growiConfig");
jest.mock("@platforms/growi/infrastructure/env/growiEnv");

describe("growiMcpSetting", () => {
  describe("makeGrowiMcpSetting", () => {
    it("設定オブジェクトを正しく作成できること", () => {
      const setting = makeGrowiMcpSetting();

      expect(setting).toBeDefined();
      expect(setting.getConfig).toBeDefined();
      expect(setting.getEnv).toBeDefined();
    });

    it("getConfigがloadGrowiConfigを呼び出すこと", async () => {
      const mockConfig = {
        baseUrl: "https://wiki.example.com",
      };
      (loadGrowiConfig as jest.Mock).mockReturnValue(mockConfig);

      const setting = makeGrowiMcpSetting();
      const config = await setting.getConfig();

      expect(loadGrowiConfig).toHaveBeenCalled();
      expect(config).toEqual(mockConfig);
    });

    it("getEnvがloadGrowiEnvを呼び出すこと", async () => {
      const mockEnv = {
        apiToken: "test-token",
        cookie: "test-cookie",
      };
      (loadGrowiEnv as jest.Mock).mockReturnValue(mockEnv);

      const setting = makeGrowiMcpSetting();
      const env = await setting.getEnv();

      expect(loadGrowiEnv).toHaveBeenCalled();
      expect(env).toEqual(mockEnv);
    });
  });
});
