import { loadDatadogEnv } from "@platforms/datadog/infrastructure/env/datadogEnv";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("datadogEnv", () => {
  describe("loadDatadogEnv", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("正しい環境変数オブジェクトを返すこと", () => {
      (getEnv as jest.Mock)
        .mockReturnValueOnce("test-api-key-123")
        .mockReturnValueOnce("test-application-key-456");

      const env = loadDatadogEnv();

      expect(env).toBeDefined();
      expect(env.apiKey).toBe("test-api-key-123");
      expect(env.applicationKey).toBe("test-application-key-456");
      expect(getEnv).toHaveBeenCalledWith("DATADOG_API_KEY");
      expect(getEnv).toHaveBeenCalledWith("DATADOG_APPLICATION_KEY");
    });

    it("apiKeyが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock)
        .mockReturnValueOnce("")
        .mockReturnValueOnce("test-application-key-456");

      expect(() => {
        loadDatadogEnv();
      }).toThrow("Datadog apiKey is required");
    });

    it("applicationKeyが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock)
        .mockReturnValueOnce("test-api-key-123")
        .mockReturnValueOnce("");

      expect(() => {
        loadDatadogEnv();
      }).toThrow("Datadog applicationKey is required");
    });
  });
});
