import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import { RedmineIssuePayload } from "../domain/repositories/redmineRepositoryPayload";
import { makeRedmineRepository } from "../infrastructure/repositories/redmineRepository";
import { makeRedmineMcpMetadata } from "./redmineMcpMetadata";
import { makeRedmineMcpSetting } from "./redmineMcpSetting";

/**
 * CLIから渡される文字列形式のクエリパラメータをRecord<string, string>に変換
 * JSON文字列の場合はパースしてオブジェクトに変換
 */
const parseQueryParams = (
  queryParams?: Record<string, string> | string,
): Record<string, string> | undefined => {
  if (typeof queryParams === "string") {
    try {
      return JSON.parse(queryParams);
    } catch {
      return undefined;
    }
  }
  return queryParams;
};

type RedmineMcpFunctions = {
  getIssues: McpFunction<
    { issues: RedmineIssuePayload[] },
    [(Record<string, string> | string)?]
  >;
  getIssue: McpFunction<
    RedmineIssuePayload,
    [string, (Record<string, string> | string)?]
  >;
};

export const makeRedmineMcp = ({
  redmineRepositoryFactory = makeRedmineRepository(),
} = {}): Mcp<RedmineMcpFunctions> => ({
  mcpFunctions: {
    getIssues: async (queryParams?: Record<string, string> | string) => {
      const params = parseQueryParams(queryParams);
      return redmineRepositoryFactory.getIssues(params);
    },
    getIssue: async (
      issueId: string,
      queryParams?: Record<string, string> | string,
    ) => {
      const params = parseQueryParams(queryParams);
      return redmineRepositoryFactory.getIssue(issueId, params);
    },
  },
  mcpMetadata: makeRedmineMcpMetadata(),
  mcpSetting: makeRedmineMcpSetting(),
});
