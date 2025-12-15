import { getEnv } from "@infrastructure/shared/env";

export type GitHubEnv = {
  personalAccessToken: string;
  // CI環境: GitHub Appsで事前生成したトークン
  githubAppToken?: string;
};

export function loadGitHubEnv(): GitHubEnv {
  const env: GitHubEnv = {
    personalAccessToken: getEnv("GH_PERSONAL_ACCESS_TOKEN"),
    // CI環境に自動で設定されているので、ローカルでは設定しない
    githubAppToken: getEnv("GITHUB_APP_TOKEN", ""),
  };

  if (!env.personalAccessToken) {
    throw new Error("GitHub personalAccessToken is required");
  }

  return env;
}
