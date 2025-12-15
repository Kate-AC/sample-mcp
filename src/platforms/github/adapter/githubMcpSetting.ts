import { McpSetting } from "@core/contracts/mcp/mcpSetting";
import {
  GitHubConfig,
  loadGitHubConfig,
} from "../domain/settings/githubConfig";
import { GitHubEnv, loadGitHubEnv } from "../infrastructure/env/githubEnv";

export type GithubMcpSetting = McpSetting<GitHubConfig, GitHubEnv>;

export const makeGithubMcpSetting = (): GithubMcpSetting => ({
  getConfig: async () => {
    return loadGitHubConfig();
  },
  getEnv: async () => {
    return loadGitHubEnv();
  },
});
