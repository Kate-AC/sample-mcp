import { Result } from "@core/result/result";
import {
  RedashAlertPayload,
  RedashDataSourcePayload,
  RedashExecuteSqlPayload,
  RedashQueryPayload,
  RedashQueryResultPayload,
} from "./redashRepositoryPayload";

export interface RedashRepository {
  getQueries: (
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ results: RedashQueryPayload[] }>>;
  getQuery: (
    queryId: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<RedashQueryPayload>>;
  getQueryResult: (
    queryId: string,
    queryParams?: Record<string, string>,
  ) => Promise<Result<RedashQueryResultPayload>>;
  getDataSources: (
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ results: RedashDataSourcePayload[] }>>;
  getAlerts: (
    queryParams?: Record<string, string>,
  ) => Promise<Result<{ results: RedashAlertPayload[] }>>;
  executeSql: (
    sql: string,
    dataSourceId: number,
  ) => Promise<Result<RedashExecuteSqlPayload>>;
}
