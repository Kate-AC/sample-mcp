import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import {
  GitHubCodeSearchPayload,
  GitHubFileContentPayload,
} from "@platforms/github/domain/repositories/githubRepositoryPayload";
import { makeGitHubRepository } from "@platforms/github/infrastructure/repositories/githubRepository";

describe("githubRepository", () => {
  describe("makeGitHubRepository", () => {
    describe("searchCode", () => {
      it("コード検索が正常に実行できること", async () => {
        const mockResponse: GitHubCodeSearchPayload = {
          total_count: 2,
          incomplete_results: false,
          items: [
            {
              name: "test1.ts",
              path: "src/test1.ts",
              sha: "abc123",
              url: "https://api.github.com/repos/example-org/repo1/contents/src/test1.ts",
              git_url:
                "https://api.github.com/repos/example-org/repo1/git/blobs/abc123",
              html_url:
                "https://github.com/example-org/repo1/blob/main/src/test1.ts",
              repository: {
                id: 1,
                name: "repo1",
                full_name: "example-org/repo1",
                html_url: "https://github.com/example-org/repo1",
                description: "Test repository 1",
              },
              score: 1.0,
            },
            {
              name: "test2.ts",
              path: "src/test2.ts",
              sha: "def456",
              url: "https://api.github.com/repos/example-org/repo2/contents/src/test2.ts",
              git_url:
                "https://api.github.com/repos/example-org/repo2/git/blobs/def456",
              html_url:
                "https://github.com/example-org/repo2/blob/main/src/test2.ts",
              repository: {
                id: 2,
                name: "repo2",
                full_name: "example-org/repo2",
                html_url: "https://github.com/example-org/repo2",
                description: "Test repository 2",
              },
              score: 0.9,
            },
          ],
        };

        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.github.com",
          headers: {},
          get: jest.fn().mockResolvedValue({
            data: mockResponse,
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeGitHubRepository(
          () => mockApiClient,
          () => mockApiClient,
        );

        const result = await repository.searchCode("addClass org:example-org", 30);

        expect(mockApiClient.get).toHaveBeenCalledWith("/search/code", {
          q: "addClass org:example-org",
          per_page: 30,
          page: 1,
        });
        expect(result.isSuccess).toBe(true);
        if (result.payload) {
          expect(result.payload.total_count).toBe(2);
          expect(result.payload.items).toHaveLength(2);
          expect(result.payload.items[0]?.name).toBe("test1.ts");
        }
      });

      it("perPageが100を超える場合は100に制限されること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.github.com",
          headers: {},
          get: jest.fn().mockResolvedValue({
            data: {
              total_count: 0,
              incomplete_results: false,
              items: [],
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeGitHubRepository(
          () => mockApiClient,
          () => mockApiClient,
        );

        await repository.searchCode("test", 150, 1);

        expect(mockApiClient.get).toHaveBeenCalledWith("/search/code", {
          q: "test",
          per_page: 100, // 150 -> 100に制限
          page: 1,
        });
      });

      it("デフォルト値が正しく設定されること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.github.com",
          headers: {},
          get: jest.fn().mockResolvedValue({
            data: {
              total_count: 0,
              incomplete_results: false,
              items: [],
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeGitHubRepository(
          () => mockApiClient,
          () => mockApiClient,
        );

        await repository.searchCode("test");

        expect(mockApiClient.get).toHaveBeenCalledWith("/search/code", {
          q: "test",
          per_page: 30, // デフォルト
          page: 1, // デフォルト
        });
      });

      it("APIエラーが適切に処理されること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.github.com",
          headers: {},
          get: jest.fn().mockRejectedValue(new Error("API Error")),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeGitHubRepository(
          () => mockApiClient,
          () => mockApiClient,
        );

        const result = await repository.searchCode("test");

        expect(result.isSuccess).toBe(false);
        expect(result.message).toBeDefined();
      });
    });

    describe("getFileContent", () => {
      it("ファイル内容取得が正常に実行できること（既存機能の確認）", async () => {
        const mockResponse: GitHubFileContentPayload = {
          name: "test.txt",
          path: "src/test.txt",
          sha: "abc123",
          size: 100,
          url: "https://api.github.com/repos/owner/repo/contents/src/test.txt",
          html_url: "https://github.com/owner/repo/blob/main/src/test.txt",
          git_url: "https://api.github.com/repos/owner/repo/git/blobs/abc123",
          download_url:
            "https://raw.githubusercontent.com/owner/repo/main/src/test.txt",
          type: "file",
          content: Buffer.from("test content").toString("base64"),
          encoding: "base64",
        };

        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.github.com",
          headers: {},
          get: jest.fn().mockResolvedValue({
            data: mockResponse,
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeGitHubRepository(
          () => mockApiClient,
          () => mockApiClient,
        );

        const result = await repository.getFileContent(
          "/repos/owner/repo/contents/src/test.txt",
        );

        expect(result.isSuccess).toBe(true);
        if (result.payload) {
          expect(result.payload.content).toBe("test content"); // base64デコードされていることを確認
        }
      });
    });
  });
});
