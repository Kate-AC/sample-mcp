import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import {
  RedashAlertPayload,
  RedashDataSourcePayload,
  RedashExecuteSqlPayload,
  RedashQueryPayload,
  RedashQueryResultPayload,
} from "../domain/repositories/redashRepositoryPayload";
import { loadRedashConfig } from "../domain/settings/redashConfig";
import { makeRedashRepository } from "../infrastructure/repositories/redashRepository";
import { makeRedashMcpMetadata } from "./redashMcpMetadata";
import { makeRedashMcpSetting } from "./redashMcpSetting";

type RedashMcpFunctions = {
  getQueries: McpFunction<
    { results: RedashQueryPayload[] },
    [Record<string, string>?]
  >;
  getQuery: McpFunction<RedashQueryPayload, [string, Record<string, string>?]>;
  getQueryResult: McpFunction<
    RedashQueryResultPayload,
    [string, Record<string, string>?]
  >;
  getDataSources: McpFunction<
    { results: RedashDataSourcePayload[] },
    [Record<string, string>?]
  >;
  getAlerts: McpFunction<
    { results: RedashAlertPayload[] },
    [Record<string, string>?]
  >;
  executeSql: McpFunction<RedashExecuteSqlPayload, [string, string]>; // [env, sql]
};

export const makeRedashMcp = ({
  redashRepositoryFactory = makeRedashRepository(),
  redashConfig = loadRedashConfig(),
} = {}): Mcp<RedashMcpFunctions> => ({
  mcpFunctions: {
    getQueries: async (queryParams?: Record<string, string>) => {
      return redashRepositoryFactory.getQueries(queryParams);
    },
    getQuery: async (queryId: string, queryParams?: Record<string, string>) => {
      return redashRepositoryFactory.getQuery(queryId, queryParams);
    },
    getQueryResult: async (
      queryId: string,
      queryParams?: Record<string, string>,
    ) => {
      return redashRepositoryFactory.getQueryResult(queryId, queryParams);
    },
    getDataSources: async (queryParams?: Record<string, string>) => {
      return redashRepositoryFactory.getDataSources(queryParams);
    },
    getAlerts: async (queryParams?: Record<string, string>) => {
      return redashRepositoryFactory.getAlerts(queryParams);
    },
    executeSql: async (dataSourceName: string, sql: string) => {
      const dataSourceId = redashConfig.dataSources[dataSourceName];

      if (!dataSourceId) {
        throw new Error(`無効な環境名またはデータソース名: ${dataSourceName}`);
      }

      return redashRepositoryFactory.executeSql(sql, dataSourceId);
    },
  },
  mcpMetadata: makeRedashMcpMetadata(),
  mcpSetting: makeRedashMcpSetting(),
});
