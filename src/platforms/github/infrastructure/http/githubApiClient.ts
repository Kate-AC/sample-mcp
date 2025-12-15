import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import {
  GitHubConfig,
  loadGitHubConfig,
} from "../../domain/settings/githubConfig";
import { GitHubEnv, loadGitHubEnv } from "../env/githubEnv";

export const makeGitHubApiClient = (
  headers: Record<string, string> = {},
  config: GitHubConfig = loadGitHubConfig(),
  env: GitHubEnv = loadGitHubEnv(),
): ApiClientPort => {
  // CI環境ではGITHUB_TOKENが提供されるため、そちらを優先して使用する
  const token = env.githubAppToken || env.personalAccessToken;

  const defaultHeaders = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitHub-Client/1.0",
    Authorization: `token ${token}`,
    ...headers,
  };

  return makeApiClient(config.baseUrl, defaultHeaders);
};

/**
 * Git diff形式のレスポンスを取得するためのクライアントを作成
 */
export const makeGitHubApiClientForGitDiff = (): ApiClientPort => {
  return makeGitHubApiClient({
    Accept: "application/vnd.github.diff",
  });
};
