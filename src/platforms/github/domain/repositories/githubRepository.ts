import { Result } from "@core/result/result";
import {
  GitHubCodeSearchPayload,
  GitHubDirectoryItemPayload,
  GitHubFileContentPayload,
  GitHubIssueSearchPayload,
  GitHubLabelPayload,
  GitHubPullRequestCommentPayload,
  GitHubPullRequestDiffPayload,
  GitHubPullRequestFilePayload,
  GitHubPullRequestListItemPayload,
  GitHubPullRequestPayload,
  GitHubRepositoryInfoPayload,
} from "./githubRepositoryPayload";

export interface GitHubRepository {
  /**
   * GitHubからファイル内容を取得する
   */
  getFileContent: (
    apiPath: string,
    ref?: string,
  ) => Promise<Result<GitHubFileContentPayload>>;

  /**
   * GitHubからリポジトリ情報を取得する
   */
  getRepositoryInfo: (
    apiPath: string,
  ) => Promise<Result<GitHubRepositoryInfoPayload>>;

  /**
   * GitHubからリポジトリ内容一覧を取得する
   */
  listRepositoryContents: (
    apiPath: string,
    ref?: string,
  ) => Promise<Result<GitHubDirectoryItemPayload[]>>;

  /**
   * GitHubからプルリクエスト情報を取得する
   */
  getPullRequest: (
    apiPath: string,
  ) => Promise<Result<GitHubPullRequestPayload>>;

  /**
   * GitHubからプルリクエストファイル一覧を取得する
   */
  getPullRequestFiles: (
    apiPath: string,
  ) => Promise<Result<GitHubPullRequestFilePayload[]>>;

  /**
   * GitHubからプルリクエスト差分を取得する
   */
  getPullRequestDiff: (
    apiPath: string,
  ) => Promise<Result<GitHubPullRequestDiffPayload>>;

  /**
   * プルリクエストにコメントを投稿する
   */
  createPullRequestComment: (
    apiPath: string,
    body: string,
  ) => Promise<Result<GitHubPullRequestCommentPayload>>;

  /**
   * プルリクエストのコメント一覧を取得する
   */
  listPullRequestComments: (
    apiPath: string,
  ) => Promise<Result<GitHubPullRequestCommentPayload[]>>;

  /**
   * GitHubでコードを検索する
   * @param query 検索クエリ（例: "addClass in:file language:js repo:example-org/sample-api"）
   * @param perPage 1ページあたりの結果数（デフォルト: 30, 最大: 100）
   * @param page ページ番号（デフォルト: 1）
   */
  searchCode: (
    query: string,
    perPage?: number,
    page?: number,
  ) => Promise<Result<GitHubCodeSearchPayload>>;

  /**
   * GitHubからプルリクエスト一覧を取得する
   * @param apiPath APIパス（例: "/repos/example-org/sample-api/pulls"）
   * @param params クエリパラメータ
   */
  listPullRequests: (
    apiPath: string,
    params?: {
      state?: "open" | "closed" | "all";
      per_page?: number;
      page?: number;
    },
  ) => Promise<Result<GitHubPullRequestListItemPayload[]>>;

  /**
   * GitHubでIssue/PRを検索する
   * @param query 検索クエリ（例: "is:pr is:open author:app/dependabot repo:example-org/sample-api"）
   * @param perPage 1ページあたりの結果数（デフォルト: 30, 最大: 100）
   * @param page ページ番号（デフォルト: 1）
   */
  searchIssues: (
    query: string,
    perPage?: number,
    page?: number,
  ) => Promise<Result<GitHubIssueSearchPayload>>;

  /**
   * Issue/PRにラベルを追加する
   * @param apiPath APIパス（例: "/repos/example-org/sample-api/issues/123/labels"）
   * @param labels 追加するラベル名の配列
   */
  addLabels: (
    apiPath: string,
    labels: string[],
  ) => Promise<Result<GitHubLabelPayload[]>>;
}
