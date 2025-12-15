import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import {
  GitHubCodeSearchPayload,
  GitHubDirectoryItemPayload,
  GitHubFileContentPayload,
  GitHubPullRequestCommentPayload,
  GitHubPullRequestDiffPayload,
  GitHubPullRequestFilePayload,
  GitHubPullRequestPayload,
  GitHubRepositoryInfoPayload,
} from "../domain/repositories/githubRepositoryPayload";
import { makeGitHubRepository } from "../infrastructure/repositories/githubRepository";
import { makeGithubMcpMetadata } from "./githubMcpMetadata";
import { makeGithubMcpSetting } from "./githubMcpSetting";

type GitHubMcpFunctions = {
  getRepositoryInfo: McpFunction<GitHubRepositoryInfoPayload, [string]>;
  getFileContent: McpFunction<GitHubFileContentPayload, [string, string?]>;
  listRepositoryContents: McpFunction<
    GitHubDirectoryItemPayload[],
    [string, string?]
  >;
  getPullRequest: McpFunction<GitHubPullRequestPayload, [string]>;
  getPullRequestFiles: McpFunction<GitHubPullRequestFilePayload[], [string]>;
  getPullRequestDiff: McpFunction<GitHubPullRequestDiffPayload, [string]>;
  searchCode: McpFunction<GitHubCodeSearchPayload, [string, number?, number?]>;
  createPullRequestComment: McpFunction<
    GitHubPullRequestCommentPayload,
    [string, string]
  >;
};

export const makeGithubMcp = ({
  githubRepositoryFactory = makeGitHubRepository(),
} = {}): Mcp<GitHubMcpFunctions> => ({
  mcpFunctions: {
    getRepositoryInfo: async (apiPath: string) => {
      return githubRepositoryFactory.getRepositoryInfo(apiPath);
    },
    getFileContent: async (apiPath: string, ref?: string) => {
      return githubRepositoryFactory.getFileContent(apiPath, ref);
    },
    listRepositoryContents: async (apiPath: string, ref?: string) => {
      return githubRepositoryFactory.listRepositoryContents(apiPath, ref);
    },
    getPullRequest: async (apiPath: string) => {
      return githubRepositoryFactory.getPullRequest(apiPath);
    },
    getPullRequestFiles: async (apiPath: string) => {
      return githubRepositoryFactory.getPullRequestFiles(apiPath);
    },
    getPullRequestDiff: async (apiPath: string) => {
      return githubRepositoryFactory.getPullRequestDiff(apiPath);
    },
    searchCode: async (query: string, perPage?: number, page?: number) => {
      return githubRepositoryFactory.searchCode(query, perPage, page);
    },
    createPullRequestComment: async (apiPath: string, body: string) => {
      return githubRepositoryFactory.createPullRequestComment(apiPath, body);
    },
  },
  mcpMetadata: makeGithubMcpMetadata(),
  mcpSetting: makeGithubMcpSetting(),
});
