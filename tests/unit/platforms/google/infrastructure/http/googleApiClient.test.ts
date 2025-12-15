import { OAuth2Client } from "google-auth-library";
import { loadGoogleConfig } from "@platforms/google/domain/settings/googleConfig";
import { getAccessToken } from "@platforms/google/infrastructure/auth/getAccessToken";
import { loadGoogleEnv } from "@platforms/google/infrastructure/env/googleEnv";
import {
  makeGoogleApiClient,
  makeGoogleCalendarApiClient,
  makeGoogleDocsApiClient,
  makeGoogleDriveApiClient,
  makeGoogleOAuth2Client,
  makeGoogleSheetsApiClient,
} from "@platforms/google/infrastructure/http/googleApiClient";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import { makeFileStorage } from "@infrastructure/shared/fileStorage";

// モジュールをモック化
jest.mock("@infrastructure/shared/apiClient");
jest.mock("@infrastructure/shared/fileStorage");
jest.mock("@platforms/google/domain/settings/googleConfig");
jest.mock("@platforms/google/infrastructure/env/googleEnv");
jest.mock("@platforms/google/infrastructure/auth/getAccessToken");
jest.mock("google-auth-library");

describe("googleApiClient", () => {
  const mockConfig = {
    baseUrl: "https://www.googleapis.com",
    docsBaseUrl: "https://docs.googleapis.com/v1",
    redirectUri: "http://localhost:3000/callback",
  };

  const mockEnv = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    accessToken: "test-access-token",
    token: {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      scope: "test-scope",
      token_type: "Bearer",
      expiry_date: 1234567890,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (loadGoogleConfig as jest.Mock).mockReturnValue(mockConfig);
    (loadGoogleEnv as jest.Mock).mockReturnValue(mockEnv);
    (getAccessToken as jest.Mock).mockResolvedValue("test-access-token");
  });

  describe("makeGoogleApiClient", () => {
    it("Google ApiClientが返されること", async () => {
      const mockApiClient = {
        baseUrl: "https://www.googleapis.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = await makeGoogleApiClient();

      expect(getAccessToken).toHaveBeenCalled();
      expect(makeApiClient).toHaveBeenCalledWith(
        "https://www.googleapis.com",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-access-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });

  describe("makeGoogleCalendarApiClient", () => {
    it("Google Calendar ApiClientが返されること", async () => {
      const mockApiClient = {
        baseUrl: "https://www.googleapis.com/calendar/v3",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = await makeGoogleCalendarApiClient();

      expect(getAccessToken).toHaveBeenCalled();
      expect(makeApiClient).toHaveBeenCalledWith(
        "https://www.googleapis.com/calendar/v3",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-access-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });

  describe("makeGoogleDocsApiClient", () => {
    it("Google Docs ApiClientが返されること", async () => {
      const mockApiClient = {
        baseUrl: "https://docs.googleapis.com/v1",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = await makeGoogleDocsApiClient();

      expect(getAccessToken).toHaveBeenCalled();
      expect(makeApiClient).toHaveBeenCalledWith(
        "https://docs.googleapis.com/v1",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-access-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });

  describe("makeGoogleSheetsApiClient", () => {
    it("Google Sheets ApiClientが返されること", async () => {
      const mockApiClient = {
        baseUrl: "https://www.googleapis.com/sheets/v4",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = await makeGoogleSheetsApiClient();

      expect(getAccessToken).toHaveBeenCalled();
      expect(makeApiClient).toHaveBeenCalledWith(
        "https://sheets.googleapis.com/v4",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-access-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });

  describe("makeGoogleDriveApiClient", () => {
    it("Google Drive ApiClientが返されること", async () => {
      const mockApiClient = {
        baseUrl: "https://www.googleapis.com/drive/v3",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = await makeGoogleDriveApiClient();

      expect(getAccessToken).toHaveBeenCalled();
      expect(makeApiClient).toHaveBeenCalledWith(
        "https://www.googleapis.com/drive/v3",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-access-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });

  describe("makeGoogleOAuth2Client", () => {
    it("OAuth2Clientが返されること", async () => {
      const mockSetCredentials = jest.fn();
      const mockOAuth2Client = {
        setCredentials: mockSetCredentials,
      };

      (OAuth2Client as unknown as jest.Mock).mockImplementation(
        () => mockOAuth2Client,
      );

      const mockFileStorage = {
        loadFile: jest.fn(),
        saveFile: jest.fn(),
        fileExists: jest.fn(),
      };

      (makeFileStorage as jest.Mock).mockReturnValue(mockFileStorage);

      const client = await makeGoogleOAuth2Client();

      expect(OAuth2Client).toHaveBeenCalledWith(
        "test-client-id",
        "test-client-secret",
        "http://localhost:3000/callback",
      );
      expect(getAccessToken).toHaveBeenCalled();
      expect(mockSetCredentials).toHaveBeenCalledWith({
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
      });
      expect(client).toBe(mockOAuth2Client);
    });
  });
});
