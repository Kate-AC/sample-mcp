import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { safeCall } from "@core/result/safeCall";
import { GitHubRepository } from "@platforms/github/domain/repositories/githubRepository";
import {
  GitHubCodeSearchPayload,
  GitHubDirectoryItemPayload,
  GitHubFileContentPayload,
  GitHubIssueSearchPayload,
  GitHubLabelPayload,
  GitHubPullRequestCommentPayload,
  GitHubPullRequestFilePayload,
  GitHubPullRequestListItemPayload,
  GitHubPullRequestPayload,
  GitHubRepositoryInfoPayload,
} from "@platforms/github/domain/repositories/githubRepositoryPayload";
import {
  makeGitHubApiClient,
  makeGitHubApiClientForGitDiff,
} from "../http/githubApiClient";

export const makeGitHubRepository = (
  apiClientFactory: () => ApiClientPort = makeGitHubApiClient,
  apiClientForDiffFactory: () => ApiClientPort = makeGitHubApiClientForGitDiff,
): GitHubRepository => ({
  /**
   * GitHubからファイル内容を取得する
   */
  getFileContent: async (apiPath: string, ref?: string) => {
    return safeCall(
      async () => {
        const client = apiClientFactory();
        return await client.get<GitHubFileContentPayload>(
          apiPath,
          ref ? { ref } : {},
        );
      },
      // base64形式で返ってきてしまうのでここで変換
      (response) => {
        if (!response.payload) {
          return response;
        }
        return Object.assign(response, {
          payload: {
            ...response.payload,
            content: Buffer.from(
              response.payload.content || "",
              "base64",
            ).toString("utf-8"),
          },
        });
      },
    );
  },

  /**
   * GitHubからリポジトリ情報を取得する
   */
  getRepositoryInfo: async (apiPath: string) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GitHubRepositoryInfoPayload>(apiPath);
    });
  },

  /**
   * GitHubからリポジトリ内容一覧を取得する
   */
  listRepositoryContents: async (apiPath: string, ref?: string) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GitHubDirectoryItemPayload[]>(
        apiPath,
        ref ? { ref } : {},
      );
    });
  },

  /**
   * GitHubからプルリクエスト情報を取得する
   */
  getPullRequest: async (apiPath: string) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GitHubPullRequestPayload>(apiPath);
    });
  },

  /**
   * GitHubからプルリクエストファイル一覧を取得する
   */
  getPullRequestFiles: async (apiPath: string) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GitHubPullRequestFilePayload[]>(apiPath);
    });
  },

  /**
   * GitHubからプルリクエスト差分を取得する
   */
  getPullRequestDiff: async (apiPath: string) => {
    return safeCall(async () => {
      const diffClient = apiClientForDiffFactory();
      const diffResponse = await diffClient.get<string>(apiPath);

      // プルリクエスト情報を取得してメタデータを追加
      const prPath = apiPath.replace("/diff", "");
      const client = apiClientFactory();
      const prInfoResponse = await client.get<GitHubPullRequestPayload>(prPath);

      // ApiResponseの形式で返す
      return {
        data: {
          diff: diffResponse.data,
          pullRequestNumber: prInfoResponse.data.number,
          pullRequestTitle: prInfoResponse.data.title,
          baseRef: prInfoResponse.data.base.ref,
          headRef: prInfoResponse.data.head.ref,
        },
        status: 200,
        statusText: "OK",
        config: {} as any,
        headers: {},
      };
    });
  },

  /**
   * プルリクエストにコメントを投稿する
   */
  createPullRequestComment: async (apiPath: string, body: string) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.post<GitHubPullRequestCommentPayload>(apiPath, {
        body,
      });
    });
  },

  /**
   * プルリクエストのコメント一覧を取得する
   */
  listPullRequestComments: async (apiPath: string) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GitHubPullRequestCommentPayload[]>(apiPath);
    });
  },

  /**
   * GitHubでコードを検索する
   */
  searchCode: async (query: string, perPage: number = 30, page: number = 1) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GitHubCodeSearchPayload>("/search/code", {
        q: query,
        per_page: Math.min(perPage, 100), // 最大100件
        page,
      });
    });
  },

  /**
   * GitHubからプルリクエスト一覧を取得する
   */
  listPullRequests: async (
    apiPath: string,
    params: {
      state?: "open" | "closed" | "all";
      per_page?: number;
      page?: number;
    } = {},
  ) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GitHubPullRequestListItemPayload[]>(apiPath, {
        state: params.state ?? "open",
        per_page: Math.min(params.per_page ?? 100, 100),
        page: params.page ?? 1,
      });
    });
  },

  /**
   * GitHubでIssue/PRを検索する
   */
  searchIssues: async (
    query: string,
    perPage: number = 30,
    page: number = 1,
  ) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<GitHubIssueSearchPayload>("/search/issues", {
        q: query,
        per_page: Math.min(perPage, 100),
        page,
      });
    });
  },

  /**
   * Issue/PRにラベルを追加する
   */
  addLabels: async (apiPath: string, labels: string[]) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.post<GitHubLabelPayload[]>(apiPath, { labels });
    });
  },
});
