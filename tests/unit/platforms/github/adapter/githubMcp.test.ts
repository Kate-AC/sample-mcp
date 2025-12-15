import { makeGithubMcp } from "@platforms/github/adapter/githubMcp";
import { GitHubRepository } from "@platforms/github/domain/repositories/githubRepository";

describe("githubMcp", () => {
  describe("makeGithubMcp", () => {
    it("MCPオブジェクトを正しく作成できること", () => {
      const mcp = makeGithubMcp({});

      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpFunctions.getFileContent).toBeDefined();
      expect(mcp.mcpFunctions.getRepositoryInfo).toBeDefined();
      expect(mcp.mcpFunctions.listRepositoryContents).toBeDefined();
      expect(mcp.mcpFunctions.getPullRequest).toBeDefined();
      expect(mcp.mcpFunctions.getPullRequestFiles).toBeDefined();
      expect(mcp.mcpFunctions.getPullRequestDiff).toBeDefined();
      expect(mcp.mcpFunctions.searchCode).toBeDefined();
      expect(mcp.mcpMetadata).toBeDefined();
      expect(mcp.mcpSetting).toBeDefined();
    });

    it("getFileContent関数が実行できること", async () => {
      const mockRepository: GitHubRepository = {
        getFileContent: jest.fn().mockResolvedValue({
          payload: { name: "test.txt", content: "test" },
          isSuccess: true,
        }),
        getRepositoryInfo: jest.fn(),
        listRepositoryContents: jest.fn(),
        getPullRequest: jest.fn(),
        getPullRequestFiles: jest.fn(),
        getPullRequestDiff: jest.fn(),
        searchCode: jest.fn(),
        createPullRequestComment: jest.fn(),
        listPullRequestComments: jest.fn(),
        listPullRequests: jest.fn(),
        searchIssues: jest.fn(),
        addLabels: jest.fn(),
      };

      const mcp = makeGithubMcp({
        githubRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.getFileContent(
        "/repos/owner/repo/contents/test.txt",
        "main",
      );

      expect(mockRepository.getFileContent).toHaveBeenCalledWith(
        "/repos/owner/repo/contents/test.txt",
        "main",
      );
      expect(result.isSuccess).toBe(true);
    });

    it("getRepositoryInfo関数が実行できること", async () => {
      const mockRepository: GitHubRepository = {
        getFileContent: jest.fn(),
        getRepositoryInfo: jest.fn().mockResolvedValue({
          payload: { name: "test-repo" },
          isSuccess: true,
        }),
        listRepositoryContents: jest.fn(),
        getPullRequest: jest.fn(),
        getPullRequestFiles: jest.fn(),
        getPullRequestDiff: jest.fn(),
        searchCode: jest.fn(),
        createPullRequestComment: jest.fn(),
        listPullRequestComments: jest.fn(),
        listPullRequests: jest.fn(),
        searchIssues: jest.fn(),
        addLabels: jest.fn(),
      };

      const mcp = makeGithubMcp({
        githubRepositoryFactory: mockRepository,
      });

      const result =
        await mcp.mcpFunctions.getRepositoryInfo("/repos/owner/repo");

      expect(mockRepository.getRepositoryInfo).toHaveBeenCalledWith(
        "/repos/owner/repo",
      );
      expect(result.isSuccess).toBe(true);
    });

    it("listRepositoryContents関数が実行できること", async () => {
      const mockRepository: GitHubRepository = {
        getFileContent: jest.fn(),
        getRepositoryInfo: jest.fn(),
        listRepositoryContents: jest.fn().mockResolvedValue({
          payload: [],
          isSuccess: true,
        }),
        getPullRequest: jest.fn(),
        getPullRequestFiles: jest.fn(),
        getPullRequestDiff: jest.fn(),
        searchCode: jest.fn(),
        createPullRequestComment: jest.fn(),
        listPullRequestComments: jest.fn(),
        listPullRequests: jest.fn(),
        searchIssues: jest.fn(),
        addLabels: jest.fn(),
      };

      const mcp = makeGithubMcp({
        githubRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.listRepositoryContents(
        "/repos/owner/repo/contents",
        "develop",
      );

      expect(mockRepository.listRepositoryContents).toHaveBeenCalledWith(
        "/repos/owner/repo/contents",
        "develop",
      );
      expect(result.isSuccess).toBe(true);
    });

    it("getPullRequest関数が実行できること", async () => {
      const mockRepository: GitHubRepository = {
        getFileContent: jest.fn(),
        getRepositoryInfo: jest.fn(),
        listRepositoryContents: jest.fn(),
        getPullRequest: jest.fn().mockResolvedValue({
          payload: { number: 123 },
          isSuccess: true,
        }),
        getPullRequestFiles: jest.fn(),
        getPullRequestDiff: jest.fn(),
        searchCode: jest.fn(),
        createPullRequestComment: jest.fn(),
        listPullRequestComments: jest.fn(),
        listPullRequests: jest.fn(),
        searchIssues: jest.fn(),
        addLabels: jest.fn(),
      };

      const mcp = makeGithubMcp({
        githubRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.getPullRequest(
        "/repos/owner/repo/pulls/123",
      );

      expect(mockRepository.getPullRequest).toHaveBeenCalledWith(
        "/repos/owner/repo/pulls/123",
      );
      expect(result.isSuccess).toBe(true);
    });

    it("searchCode関数が実行できること", async () => {
      const mockRepository: GitHubRepository = {
        getFileContent: jest.fn(),
        getRepositoryInfo: jest.fn(),
        listRepositoryContents: jest.fn(),
        getPullRequest: jest.fn(),
        getPullRequestFiles: jest.fn(),
        getPullRequestDiff: jest.fn(),
        createPullRequestComment: jest.fn(),
        listPullRequestComments: jest.fn(),
        searchCode: jest.fn().mockResolvedValue({
          payload: {
            total_count: 1,
            incomplete_results: false,
            items: [
              {
                name: "test.ts",
                path: "src/test.ts",
                sha: "abc123",
                url: "https://api.github.com/repos/owner/repo/contents/src/test.ts",
                git_url:
                  "https://api.github.com/repos/owner/repo/git/blobs/abc123",
                html_url: "https://github.com/owner/repo/blob/main/src/test.ts",
                repository: {
                  id: 1,
                  name: "repo",
                  full_name: "owner/repo",
                  html_url: "https://github.com/owner/repo",
                  description: "Test repository",
                },
                score: 1.0,
              },
            ],
          },
          isSuccess: true,
        }),
        listPullRequests: jest.fn(),
        searchIssues: jest.fn(),
        addLabels: jest.fn(),
      };

      const mcp = makeGithubMcp({
        githubRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.searchCode(
        "addClass org:example-org",
        30,
        1,
      );

      expect(mockRepository.searchCode).toHaveBeenCalledWith(
        "addClass org:example-org",
        30,
        1,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.total_count).toBe(1);
      expect(result.payload.items).toHaveLength(1);
    });
  });
});
