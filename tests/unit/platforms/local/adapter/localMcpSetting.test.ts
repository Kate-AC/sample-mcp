import { makeLocalMcpSetting } from "@platforms/local/adapter/localMcpSetting";

describe("localMcpSetting", () => {
  describe("makeLocalMcpSetting", () => {
    it("設定オブジェクトを正しく作成できること", () => {
      const setting = makeLocalMcpSetting();

      expect(setting).toBeDefined();
      expect(setting.getConfig).toBeDefined();
      expect(setting.getEnv).toBeDefined();
    });

    it("getConfigが空のオブジェクトを返すこと", async () => {
      const setting = makeLocalMcpSetting();
      const config = await setting.getConfig();

      expect(config).toEqual({});
    });

    it("getEnvがLocalEnvオブジェクトを返すこと", async () => {
      // 環境変数を設定
      const originalValue = process.env["LOCAL_SOURCE_BASE_PATH"];
      process.env["LOCAL_SOURCE_BASE_PATH"] = "/test/path";

      try {
        const setting = makeLocalMcpSetting();
        const env = await setting.getEnv();

        expect(env).toHaveProperty("sourceBasePath");
        expect(env.sourceBasePath).toBe("/test/path");
      } finally {
        // 環境変数を元に戻す
        if (originalValue !== undefined) {
          process.env["LOCAL_SOURCE_BASE_PATH"] = originalValue;
        } else {
          delete process.env["LOCAL_SOURCE_BASE_PATH"];
        }
      }
    });
  });
});
