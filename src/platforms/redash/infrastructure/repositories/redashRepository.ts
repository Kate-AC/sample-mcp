import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { safeCall } from "@core/result/safeCall";
import {
  RedashPrivacyFilterList,
  makeRedashPrivacyFilterList,
} from "@platforms/redash/application/privacy/redashPrivacyFilter";
import { RedashRepository } from "@platforms/redash/domain/repositories/redashRepository";
import {
  RedashAlertPayload,
  RedashDataSourcePayload,
  RedashExecuteSqlPayload,
  RedashJobPayload,
  RedashQueryPayload,
  RedashQueryResultPayload,
} from "@platforms/redash/domain/repositories/redashRepositoryPayload";
import { makeRedashApiClient } from "../http/redashApiClient";

export const makeRedashRepository = (
  apiClientFactory: () => ApiClientPort = makeRedashApiClient,
  redashPrivacyFilterList: RedashPrivacyFilterList = makeRedashPrivacyFilterList(),
): RedashRepository => ({
  getQueries: async (queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<{ results: RedashQueryPayload[] }>(
        "/api/queries",
        queryParams || {},
      );
    });
  },
  getQuery: async (queryId: string, queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<RedashQueryPayload>(
        `/api/queries/${queryId}`,
        queryParams || {},
      );
    }, redashPrivacyFilterList.query);
  },
  getQueryResult: async (
    queryId: string,
    queryParams?: Record<string, string>,
  ) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<RedashQueryResultPayload>(
        `/api/queries/${queryId}/results`,
        queryParams || {},
      );
    });
  },
  getDataSources: async (queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<{ results: RedashDataSourcePayload[] }>(
        "/api/data_sources",
        queryParams || {},
      );
    });
  },
  getAlerts: async (queryParams?: Record<string, string>) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<{ results: RedashAlertPayload[] }>(
        "/api/alerts",
        queryParams || {},
      );
    });
  },
  executeSql: async (sql: string, dataSourceId: number) => {
    return safeCall(async () => {
      const client = apiClientFactory();

      // 1. SQLを実行（ジョブ作成）
      const createResponse = await client.post<
        RedashJobPayload | RedashQueryResultPayload
      >("/api/query_results", {
        query: sql,
        data_source_id: dataSourceId,
      });

      // ケース1: 即座に結果が返ってきた場合（query_resultが存在）
      if ("query_result" in createResponse.data) {
        const queryResult = createResponse.data.query_result;
        const resultData: RedashExecuteSqlPayload = {
          columns: queryResult.data.columns,
          rows: queryResult.data.rows,
          runtime: queryResult.runtime,
          retrieved_at: queryResult.retrieved_at,
        };

        return {
          data: resultData,
          status: 200,
          statusText: "OK",
          config: {} as any,
          headers: {},
        };
      }

      // ケース2: ジョブとして実行される場合
      if (!("job" in createResponse.data) || !createResponse.data.job?.id) {
        throw new Error(
          "レスポンスにジョブIDまたはクエリ結果が含まれていません",
        );
      }

      const jobId = createResponse.data.job.id;

      // 2. ジョブの完了を待つ（ポーリング）
      let queryResultId: number | undefined;
      const maxAttempts = 30;
      const intervalMs = 1000;

      for (let i = 0; i < maxAttempts; i++) {
        const jobResponse = await client.get<RedashJobPayload>(
          `/api/jobs/${jobId}`,
          {},
        );

        const job = jobResponse.data.job;

        if (job.status === 3) {
          // 成功
          queryResultId = job.query_result_id;
          break;
        } else if (job.status === 4) {
          // 失敗
          throw new Error(`クエリ実行に失敗: ${job.error}`);
        }

        // まだ実行中、待機
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      if (!queryResultId) {
        throw new Error(
          `タイムアウト: ジョブが${(maxAttempts * intervalMs) / 1000}秒以内に完了しませんでした`,
        );
      }

      // 3. 結果を取得
      const resultResponse = await client.get<RedashQueryResultPayload>(
        `/api/query_results/${queryResultId}`,
        {},
      );

      const queryResult = resultResponse.data.query_result;
      const resultData: RedashExecuteSqlPayload = {
        columns: queryResult.data.columns,
        rows: queryResult.data.rows,
        runtime: queryResult.runtime,
        retrieved_at: queryResult.retrieved_at,
      };

      return {
        data: resultData,
        status: 200,
        statusText: "OK",
        config: {} as any,
        headers: {},
      };
    }, redashPrivacyFilterList.executeSql);
  },
});
