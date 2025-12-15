import { OAuth2Client } from "google-auth-library";
import { FileStoragePort } from "@core/contracts/application/fileStoragePort";
import {
  GoogleConfig,
  loadGoogleConfig,
} from "@platforms/google/domain/settings/googleConfig";
import {
  GoogleEnv,
  loadGoogleEnv,
} from "@platforms/google/infrastructure/env/googleEnv";
import { makeFileStorage } from "@infrastructure/shared/fileStorage";

/**
 * 保存されたトークンが有効かチェック
 */
const isTokenValid = (env: GoogleEnv): boolean => {
  if (!env.accessToken || !env.token?.expiry_date) {
    return false;
  }

  const currentTime = new Date().getTime();
  const expiryTime = env.token.expiry_date;

  return currentTime < expiryTime;
};

/**
 * 新しいアクセストークンを取得して保存
 */
const refreshAndSaveToken = async (
  filePath: string,
  fileStorage: FileStoragePort,
  config: GoogleConfig,
  env: GoogleEnv,
): Promise<string> => {
  // OAuth2Clientを使ってリフレッシュトークンから新しいアクセストークンを取得
  const client = new OAuth2Client(
    env.clientId,
    env.clientSecret,
    config.redirectUri,
  );

  client.setCredentials({ refresh_token: env.token.refresh_token });

  const { credentials } = await client.refreshAccessToken();

  if (!credentials?.access_token) {
    throw new Error("Failed to get access token from OAuth2 client.");
  }

  // 新しいトークンを保存
  await fileStorage.saveFile(filePath, credentials.access_token, {
    encoding: "utf8",
    overwrite: true,
    createDirectory: true,
  });

  return credentials.access_token;
};

/**
 * アクセストークンを取得する。ファイルから読み込むか、OAuth2フローで取得する。
 */
export const getAccessToken = async (
  deps: {
    config: GoogleConfig;
    env: GoogleEnv;
    fileStorage: FileStoragePort;
  } = {
    config: loadGoogleConfig(),
    env: loadGoogleEnv(),
    fileStorage: makeFileStorage(),
  },
): Promise<string> => {
  // ファイルからトークンを読み込み
  const result = await deps.fileStorage.loadFile(
    deps.config.accessTokenFilePath,
    "utf8",
  );

  // ファイルが存在しない、または読み込み失敗 → リフレッシュ
  if (!result.isSuccess || !result.payload?.content) {
    return refreshAndSaveToken(
      deps.config.accessTokenFilePath,
      deps.fileStorage,
      deps.config,
      deps.env,
    );
  }

  const savedToken = result.payload.content.trim();

  // トークンが空 → リフレッシュ
  if (!savedToken) {
    return refreshAndSaveToken(
      deps.config.accessTokenFilePath,
      deps.fileStorage,
      deps.config,
      deps.env,
    );
  }

  // トークンの有効期限をチェック
  if (!isTokenValid(deps.env)) {
    return refreshAndSaveToken(
      deps.config.accessTokenFilePath,
      deps.fileStorage,
      deps.config,
      deps.env,
    );
  }

  return savedToken;
};
