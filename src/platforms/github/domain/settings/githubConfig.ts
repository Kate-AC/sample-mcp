export type GitHubConfig = {
  /** GitHub APIのベースURL */
  baseUrl: string;
};

export function loadGitHubConfig(): GitHubConfig {
  const config: GitHubConfig = {
    baseUrl: "https://api.github.com",
  };

  return config;
}
