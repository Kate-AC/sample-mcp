import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { safeCall } from "@core/result/safeCall";
import { redmineRepository } from "@platforms/redmine/domain/repositories/redmineRepository";
import { RedmineIssuePayload } from "@platforms/redmine/domain/repositories/redmineRepositoryPayload";
import { makeRedmineApiClient } from "../http/redmineApiClient";

export const makeRedmineRepository = (
  apiClientFactory: () => ApiClientPort = makeRedmineApiClient,
): redmineRepository => ({
  /**
   * Redmineから課題一覧を取得する
   */
  getIssues: async (queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<{ issues: RedmineIssuePayload[] }>(
        "/issues.json",
        queryParams,
      );
    });
  },

  /**
   * Redmineから特定の課題を取得する
   * デフォルトで親チケット、子チケット、関連、コメント（journals）を含む
   */
  getIssue: async (issueId: string, queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      // デフォルトでinclude=children,relations,journalsを含める
      const params = {
        include: "children,relations,journals",
        ...queryParams,
      };
      return await client.get<RedmineIssuePayload>(
        `/issues/${issueId}.json`,
        params,
      );
    });
  },
});
