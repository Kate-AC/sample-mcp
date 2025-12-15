import { OAuth2Client } from "google-auth-library";
import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { FileStoragePort } from "@core/contracts/application/fileStoragePort";
import {
  GoogleConfig,
  loadGoogleConfig,
} from "@platforms/google/domain/settings/googleConfig";
import {
  GoogleEnv,
  loadGoogleEnv,
} from "@platforms/google/infrastructure/env/googleEnv";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import { makeFileStorage } from "@infrastructure/shared/fileStorage";
import { getAccessToken } from "../auth/getAccessToken";

/**
 * Google API用のクライアントを作成
 */
export const makeGoogleApiClient = async (
  config: GoogleConfig = loadGoogleConfig(),
): Promise<ApiClientPort> => {
  const accessToken = await getAccessToken();
  return makeApiClient(config.baseUrl, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });
};

/**
 * Google Calendar API用のクライアントを作成
 */
export const makeGoogleCalendarApiClient = async (
  config: GoogleConfig = loadGoogleConfig(),
): Promise<ApiClientPort> => {
  const accessToken = await getAccessToken();
  return makeApiClient(`${config.baseUrl}/calendar/v3`, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });
};

/**
 * Google Docs API用のクライアントを作成
 */
export const makeGoogleDocsApiClient = async (
  config: GoogleConfig = loadGoogleConfig(),
): Promise<ApiClientPort> => {
  const accessToken = await getAccessToken();
  return makeApiClient(config.docsBaseUrl, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });
};

/**
 * Google Sheets API用のクライアントを作成
 */
export const makeGoogleSheetsApiClient = async (): Promise<ApiClientPort> => {
  const accessToken = await getAccessToken();
  return makeApiClient("https://sheets.googleapis.com/v4", {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });
};

/**
 * Google Drive API用のクライアントを作成
 */
export const makeGoogleDriveApiClient = async (
  config: GoogleConfig = loadGoogleConfig(),
): Promise<ApiClientPort> => {
  const accessToken = await getAccessToken();
  return makeApiClient(`${config.baseUrl}/drive/v3`, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });
};

/**
 * Google OAuth2クライアントを作成
 */
export const makeGoogleOAuth2Client = async (
  deps: {
    config: GoogleConfig;
    env: GoogleEnv;
    fileStorage: FileStoragePort;
  } = {
    config: loadGoogleConfig(),
    env: loadGoogleEnv(),
    fileStorage: makeFileStorage(),
  },
): Promise<OAuth2Client> => {
  const client = new OAuth2Client(
    deps.env.clientId,
    deps.env.clientSecret,
    deps.config.redirectUri,
  );

  // アクセストークンを取得（getAccessTokenが内部でリフレッシュも行う）
  const accessToken = await getAccessToken(deps);

  client.setCredentials({
    access_token: accessToken,
    refresh_token: deps.env.token.refresh_token,
  });

  return client;
};
