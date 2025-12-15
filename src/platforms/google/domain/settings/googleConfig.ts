import * as os from "os";
import * as path from "path";

export type GoogleConfig = {
  /** Google APIのベースURL */
  baseUrl: string;
  /** Google Docs APIのベースURL */
  docsBaseUrl: string;
  /** アクセストークンのファイルパス */
  accessTokenFilePath: string;
  /** OAuth2のリダイレクトURI */
  redirectUri: string;
  /** OAuth2のスコープ */
  scopes: string[];
};

export function loadGoogleConfig(): GoogleConfig {
  const homeDir = os.homedir();
  const cacheDir = path.join(homeDir, ".cache", "sample-mcp-kit");

  const config: GoogleConfig = {
    baseUrl: "https://www.googleapis.com",
    docsBaseUrl: "https://docs.googleapis.com/v1",
    accessTokenFilePath: path.join(cacheDir, "google_access_token.txt"),
    /**
     * URLからcodeパラメータを拾えればいいのでなんでもよい
     */
    redirectUri: "http://localhost:8080/oauth2callback",
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  };

  if (!config.redirectUri) {
    throw new Error("Google redirectUri is required");
  }

  return config;
}
