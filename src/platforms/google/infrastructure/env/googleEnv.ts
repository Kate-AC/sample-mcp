import { getEnv } from "@infrastructure/shared/env";

export type GoogleEnv = {
  accessToken: string;
  clientId: string;
  clientSecret: string;
  token: any;
};

export function loadGoogleEnv(): GoogleEnv {
  const credentialsJson = getEnv("GOOGLE_CREDENTIALS_JSON");
  const tokenJson = getEnv("GOOGLE_TOKEN_JSON");

  if (!credentialsJson) {
    throw new Error("GOOGLE_CREDENTIALS_JSON is required");
  }

  if (!tokenJson) {
    throw new Error("GOOGLE_TOKEN_JSON is required");
  }

  let credentials: any;
  let token: any;

  try {
    credentials = JSON.parse(credentialsJson);
    token = JSON.parse(tokenJson);
  } catch (error) {
    throw new Error(`Failed to parse Google JSON: ${error}`);
  }

  const env: GoogleEnv = {
    accessToken: token.access_token,
    clientId: credentials.installed.client_id,
    clientSecret: credentials.installed.client_secret,
    token: token,
  };

  if (!env.clientId) {
    throw new Error("Google clientId is required");
  }

  if (!env.clientSecret) {
    throw new Error("Google clientSecret is required");
  }

  return env;
}
