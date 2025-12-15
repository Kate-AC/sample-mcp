import { OAuth2Client } from "google-auth-library";
import { GoogleConfig } from "@platforms/google/domain/settings/googleConfig";
import {
  exchangeGoogleCodeForToken,
  generateGoogleAuthUrl,
} from "@platforms/google/infrastructure/auth/googleOAuth2";
import { GoogleEnv } from "@platforms/google/infrastructure/env/googleEnv";

// モジュールをモック化
jest.mock("google-auth-library");

describe("googleOAuth", () => {
  const mockConfig: GoogleConfig = {
    baseUrl: "https://www.googleapis.com",
    docsBaseUrl: "https://docs.googleapis.com/v1",
    accessTokenFilePath: "/tmp/google_access_token.txt",
    redirectUri: "http://localhost:8080/oauth2callback",
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/documents",
    ],
  };

  const mockEnv: GoogleEnv = {
    accessToken: "test-access-token",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    token: {
      expiry_date: new Date().getTime() + 3600000,
      refresh_token: "test-refresh-token",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateGoogleAuthUrl", () => {
    it("OAuth2認証URLを生成できること", () => {
      const mockGenerateAuthUrl = jest
        .fn()
        .mockReturnValue("https://accounts.google.com/o/oauth2/v2/auth?...");

      const mockOAuth2Client = {
        generateAuthUrl: mockGenerateAuthUrl,
      };

      (OAuth2Client as unknown as jest.Mock).mockImplementation(
        () => mockOAuth2Client,
      );

      const authUrl = generateGoogleAuthUrl(mockConfig, mockEnv);

      expect(OAuth2Client).toHaveBeenCalledWith(
        mockEnv.clientId,
        mockEnv.clientSecret,
        mockConfig.redirectUri,
      );
      expect(mockGenerateAuthUrl).toHaveBeenCalledWith({
        access_type: "offline",
        scope: mockConfig.scopes,
        prompt: "consent",
      });
      expect(authUrl).toBe("https://accounts.google.com/o/oauth2/v2/auth?...");
    });
  });

  describe("exchangeGoogleCodeForToken", () => {
    it("認証コードをトークンに交換できること", async () => {
      const mockTokens = {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expiry_date: new Date().getTime() + 3600000,
      };

      const mockGetToken = jest.fn().mockResolvedValue({ tokens: mockTokens });
      const mockSetCredentials = jest.fn();

      const mockOAuth2Client = {
        getToken: mockGetToken,
        setCredentials: mockSetCredentials,
      };

      (OAuth2Client as unknown as jest.Mock).mockImplementation(
        () => mockOAuth2Client,
      );

      const result = await exchangeGoogleCodeForToken(
        "test-auth-code",
        mockConfig,
        mockEnv,
      );

      expect(OAuth2Client).toHaveBeenCalledWith(
        mockEnv.clientId,
        mockEnv.clientSecret,
        mockConfig.redirectUri,
      );
      expect(mockGetToken).toHaveBeenCalledWith("test-auth-code");
      expect(mockSetCredentials).toHaveBeenCalledWith(mockTokens);
      expect(result.client).toBe(mockOAuth2Client);
      expect(result.tokens).toEqual(mockTokens);
    });

    it("無効なコードの場合、エラーをthrowすること", async () => {
      const mockGetToken = jest
        .fn()
        .mockRejectedValue(new Error("Invalid authorization code"));

      const mockOAuth2Client = {
        getToken: mockGetToken,
        setCredentials: jest.fn(),
      };

      (OAuth2Client as unknown as jest.Mock).mockImplementation(
        () => mockOAuth2Client,
      );

      await expect(
        exchangeGoogleCodeForToken("invalid-code", mockConfig, mockEnv),
      ).rejects.toThrow("Invalid authorization code");
    });
  });
});
