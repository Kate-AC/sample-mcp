import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import {
  DatadogLogSearchPayload,
  TraceMetadataPayload,
} from "../domain/repositories/datadogRepositoryPayload";
import { makeDatadogRepository } from "../infrastructure/repositories/datadogRepository";
import { makeDatadogMcpMetadata } from "./datadogMcpMetadata";
import { makeDatadogMcpSetting } from "./datadogMcpSetting";

type DatadogMcpFunctions = {
  searchLogs: McpFunction<DatadogLogSearchPayload, [string, number?]>;
  searchLogsFromUrl: McpFunction<DatadogLogSearchPayload, [string]>;
  getTraceMetadataBySpanId: McpFunction<TraceMetadataPayload, [string]>;
  searchLogsByCompanyCode: McpFunction<
    DatadogLogSearchPayload,
    [string, string, string, string?]
  >;
};

export const makeDatadogMcp = ({
  datadogRepositoryFactory = makeDatadogRepository(),
} = {}): Mcp<DatadogMcpFunctions> => ({
  mcpFunctions: {
    searchLogs: async (query: string, limit?: number) => {
      return datadogRepositoryFactory.searchLogs(query, limit);
    },
    searchLogsFromUrl: async (url: string) => {
      return datadogRepositoryFactory.searchLogsFromUrl(url);
    },
    getTraceMetadataBySpanId: async (spanId: string) => {
      return datadogRepositoryFactory.getTraceMetadataBySpanId(spanId);
    },
    searchLogsByCompanyCode: async (
      companyCode: string,
      fromDateTime: string,
      toDateTime: string,
      index?: string,
    ) => {
      return datadogRepositoryFactory.searchLogsByCompanyCode(
        companyCode,
        fromDateTime,
        toDateTime,
        index,
      );
    },
  },
  mcpMetadata: makeDatadogMcpMetadata(),
  mcpSetting: makeDatadogMcpSetting(),
});
