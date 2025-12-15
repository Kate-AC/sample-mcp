import { loadGoogleEnv } from "@platforms/google/infrastructure/env/googleEnv";
import { getEnv } from "@infrastructure/shared/env";

// モジュールをモック化
jest.mock("@infrastructure/shared/env");

describe("googleEnv", () => {
  describe("loadGoogleEnv", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("正しい環境変数オブジェクトを返すこと", () => {
      const credentialsJson = JSON.stringify({
        installed: {
          client_id: "test-client-id",
          client_secret: "test-client-secret",
        },
      });
      const tokenJson = JSON.stringify({
        access_token: "test-access-token",
      });

      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "GOOGLE_CREDENTIALS_JSON") return credentialsJson;
        if (key === "GOOGLE_TOKEN_JSON") return tokenJson;
        return "";
      });

      const env = loadGoogleEnv();

      expect(env).toBeDefined();
      expect(env.clientId).toBe("test-client-id");
      expect(env.clientSecret).toBe("test-client-secret");
      expect(env.accessToken).toBe("test-access-token");
    });

    it("clientIdが空の場合、エラーをスローすること", () => {
      const credentialsJson = JSON.stringify({
        installed: {
          client_id: "",
          client_secret: "test-client-secret",
        },
      });
      const tokenJson = JSON.stringify({
        access_token: "test-access-token",
      });

      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "GOOGLE_CREDENTIALS_JSON") return credentialsJson;
        if (key === "GOOGLE_TOKEN_JSON") return tokenJson;
        return "";
      });

      expect(() => {
        loadGoogleEnv();
      }).toThrow("Google clientId is required");
    });

    it("clientSecretが空の場合、エラーをスローすること", () => {
      const credentialsJson = JSON.stringify({
        installed: {
          client_id: "test-client-id",
          client_secret: "",
        },
      });
      const tokenJson = JSON.stringify({
        access_token: "test-access-token",
      });

      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "GOOGLE_CREDENTIALS_JSON") return credentialsJson;
        if (key === "GOOGLE_TOKEN_JSON") return tokenJson;
        return "";
      });

      expect(() => {
        loadGoogleEnv();
      }).toThrow("Google clientSecret is required");
    });

    it("GOOGLE_CREDENTIALS_JSONが空の場合、エラーをスローすること", () => {
      (getEnv as jest.Mock).mockImplementation((key: string) => {
        if (key === "GOOGLE_CREDENTIALS_JSON") return "";
        if (key === "GOOGLE_TOKEN_JSON") return "{}";
        return "";
      });

      expect(() => {
        loadGoogleEnv();
      }).toThrow("GOOGLE_CREDENTIALS_JSON is required");
    });
  });
});
