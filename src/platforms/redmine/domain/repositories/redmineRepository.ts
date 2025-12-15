import { Result } from "@core/result/result";
import { RedmineIssuePayload } from "./redmineRepositoryPayload";

export interface redmineRepository {
  /**
   * Redmineから課題一覧を取得する
   */
  getIssues: (
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ issues: RedmineIssuePayload[] }>>;

  /**
   * Redmineから特定の課題を取得する
   * デフォルトで親チケット、子チケット、関連、コメント（journals）を含む
   * queryParamsで上書き可能
   */
  getIssue: (
    issueId: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<RedmineIssuePayload>>;
}
