import { OAuth2Client } from "google-auth-library";
import { FileStoragePort } from "@core/contracts/application/fileStoragePort";
import { GoogleConfig } from "@platforms/google/domain/settings/googleConfig";
import { getAccessToken } from "@platforms/google/infrastructure/auth/getAccessToken";
import { GoogleEnv } from "@platforms/google/infrastructure/env/googleEnv";

// モジュールをモック化
jest.mock("google-auth-library");

describe("getAccessToken", () => {
  const mockConfig: GoogleConfig = {
    baseUrl: "https://www.googleapis.com",
    docsBaseUrl: "https://docs.googleapis.com/v1",
    accessTokenFilePath: "/tmp/google_access_token.txt",
    redirectUri: "http://localhost:8080/oauth2callback",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  };

  const validEnv: GoogleEnv = {
    accessToken: "valid-token",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    token: {
      expiry_date: new Date().getTime() + 3600000, // 1時間後
      refresh_token: "test-refresh-token",
    },
  };

  const expiredEnv: GoogleEnv = {
    accessToken: "expired-token",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    token: {
      expiry_date: new Date().getTime() - 3600000, // 1時間前
      refresh_token: "test-refresh-token",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("トークンが有効な場合", () => {
    it("保存されたトークンを返すこと", async () => {
      const mockFileStorage: FileStoragePort = {
        loadFile: jest.fn().mockResolvedValue({
          payload: { content: "valid-saved-token" },
          isSuccess: true,
        }),
        saveFile: jest.fn(),
        fileExists: jest.fn(),
      };

      const token = await getAccessToken({
        config: mockConfig,
        env: validEnv,
        fileStorage: mockFileStorage,
      });

      expect(mockFileStorage.loadFile).toHaveBeenCalledWith(
        mockConfig.accessTokenFilePath,
        "utf8",
      );
      expect(token).toBe("valid-saved-token");
      expect(mockFileStorage.saveFile).not.toHaveBeenCalled();
    });
  });

  describe("トークンファイルが存在しない場合", () => {
    it("新しいトークンを取得して保存すること", async () => {
      const mockFileStorage: FileStoragePort = {
        loadFile: jest.fn().mockResolvedValue({
          payload: null,
          isSuccess: false,
          message: "File not found",
        }),
        saveFile: jest.fn().mockResolvedValue({
          payload: { filePath: mockConfig.accessTokenFilePath },
          isSuccess: true,
        }),
        fileExists: jest.fn(),
      };

      // OAuth2Clientのモック
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
        refreshAccessToken: jest.fn().mockResolvedValue({
          credentials: {
            access_token: "new-token",
          },
        }),
      };
      (OAuth2Client as unknown as jest.Mock).mockImplementation(
        () => mockOAuth2Client,
      );

      const token = await getAccessToken({
        config: mockConfig,
        env: validEnv,
        fileStorage: mockFileStorage,
      });

      expect(mockOAuth2Client.refreshAccessToken).toHaveBeenCalled();
      expect(mockFileStorage.saveFile).toHaveBeenCalledWith(
        mockConfig.accessTokenFilePath,
        "new-token",
        {
          encoding: "utf8",
          overwrite: true,
          createDirectory: true,
        },
      );
      expect(token).toBe("new-token");
    });
  });

  describe("トークンが期限切れの場合", () => {
    it("新しいトークンを取得すること", async () => {
      const mockFileStorage: FileStoragePort = {
        loadFile: jest.fn().mockResolvedValue({
          payload: { content: "expired-token-in-file" },
          isSuccess: true,
        }),
        saveFile: jest.fn().mockResolvedValue({
          payload: { filePath: mockConfig.accessTokenFilePath },
          isSuccess: true,
        }),
        fileExists: jest.fn(),
      };

      // OAuth2Clientのモック
      const mockOAuth2Client = {
        setCredentials: jest.fn(),
        refreshAccessToken: jest.fn().mockResolvedValue({
          credentials: {
            access_token: "refreshed-token",
          },
        }),
      };
      (OAuth2Client as unknown as jest.Mock).mockImplementation(
        () => mockOAuth2Client,
      );

      const token = await getAccessToken({
        config: mockConfig,
        env: expiredEnv,
        fileStorage: mockFileStorage,
      });

      expect(mockOAuth2Client.refreshAccessToken).toHaveBeenCalled();
      expect(token).toBe("refreshed-token");
    });
  });
});
