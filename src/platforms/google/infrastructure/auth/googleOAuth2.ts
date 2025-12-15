import { OAuth2Client } from "google-auth-library";
import {
  GoogleConfig,
  loadGoogleConfig,
} from "@platforms/google/domain/settings/googleConfig";
import {
  GoogleEnv,
  loadGoogleEnv,
} from "@platforms/google/infrastructure/env/googleEnv";

/**
 * OAuth2認証URLを生成
 */
export const generateGoogleAuthUrl = (
  config: GoogleConfig = loadGoogleConfig(),
  env: GoogleEnv = loadGoogleEnv(),
): string => {
  const client = new OAuth2Client(
    env.clientId,
    env.clientSecret,
    config.redirectUri,
  );

  return client.generateAuthUrl({
    access_type: "offline",
    scope: config.scopes,
    prompt: "consent",
  });
};

/**
 * 認証コードをトークンに交換
 */
export const exchangeGoogleCodeForToken = async (
  code: string,
  config: GoogleConfig = loadGoogleConfig(),
  env: GoogleEnv = loadGoogleEnv(),
): Promise<{
  client: OAuth2Client;
  tokens: any;
}> => {
  const client = new OAuth2Client(
    env.clientId,
    env.clientSecret,
    config.redirectUri,
  );

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  return { client, tokens };
};
