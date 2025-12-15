import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { safeCall } from "@core/result/safeCall";
import { DatadogRepository } from "@platforms/datadog/domain/repositories/datadogRepository";
import {
  DatadogLogSearchPayload,
  DatadogMonitorPayload,
  DatadogTracePayload,
  TraceMetadataPayload,
} from "@platforms/datadog/domain/repositories/datadogRepositoryPayload";
import { extractMetadataFromTrace } from "@platforms/datadog/domain/services/datadogTraceMetadataExtractor";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import { makeDatadogApiClient } from "../http/datadogApiClient";

export const makeDatadogRepository = (
  apiClientFactory: () => Promise<ApiClientPort> = makeDatadogApiClient,
): DatadogRepository => {
  // searchLogsの実装を先に定義
  const searchLogsImpl = async (
    query: string,
    limit: number = 100,
    from?: string,
    to?: string,
  ) => {
    return safeCall(async () => {
      const apiClient = await apiClientFactory();
      const filter: Record<string, unknown> = {
        query,
        indexes: [],
      };
      if (from) filter["from"] = from;
      if (to) filter["to"] = to;

      return await apiClient.post<DatadogLogSearchPayload>(
        "/logs/events/search",
        {
          filter,
          page: {
            limit,
          },
        },
      );
    });
  };

  return {
    /**
     * Datadogログを検索する
     */
    searchLogs: searchLogsImpl,

    /**
     * Datadogログ分析URLからログを検索する
     * URL種別（/logs, /monitors, /error-tracking）に応じて適切なクエリを構築する
     */
    searchLogsFromUrl: async (url: string) => {
      const urlObj = new URL(url);
      const fromTs = urlObj.searchParams.get("from_ts");
      const toTs = urlObj.searchParams.get("to_ts");
      const from = fromTs ? new Date(Number(fromTs)).toISOString() : undefined;
      const to = toTs ? new Date(Number(toTs)).toISOString() : undefined;
      const pathname = urlObj.pathname;

      // /monitors/{id} の場合: Monitor APIからクエリを取得
      const monitorMatch = pathname.match(/^\/monitors\/(\d+)/);
      if (monitorMatch && monitorMatch[1]) {
        const monitorId = monitorMatch[1];
        const query = await fetchLogQueryFromMonitor(
          apiClientFactory,
          monitorId,
        );
        return searchLogsImpl(query, 100, from, to);
      }

      // /error-tracking の場合: queryに status:error を付与
      if (pathname.startsWith("/error-tracking")) {
        const query = urlObj.searchParams.get("query") || "";
        const errorQuery = query ? `${query} status:error` : "status:error";
        return searchLogsImpl(errorQuery, 100, from, to);
      }

      // /logs 等: 従来の動作
      const query = urlObj.searchParams.get("query") || "";
      return searchLogsImpl(query, 100, from, to);
    },

    /**
     * APMトレースのメタデータを取得する
     *
     * 注意: エンドポイントは`/trace/{trace_id}`だが、実際にはログから取得できるのは`span_id`のみ。
     * ただし、Datadog APIは`span_id`でも`trace_id`として受け付けるため、`span_id`を渡すことで取得可能。
     * ルートスパンの場合、`span_id`と`trace_id`が同じ値になることがある。
     *
     * @param spanId スパンID（ログのdd.span_id）
     */
    getTraceMetadataBySpanId: async (spanId: string) => {
      const traceResult = await safeCall(async () => {
        const apiClient = await apiClientFactory();
        return await apiClient.get<DatadogTracePayload>(`/trace/${spanId}`);
      });

      if (!traceResult.isSuccess || !traceResult.payload) {
        return {
          ...traceResult,
          payload: {
            metadata: {},
          } as TraceMetadataPayload,
          message: traceResult.message || "Trace not found",
        };
      }

      const metadata = extractMetadataFromTrace(traceResult.payload);

      return {
        ...traceResult,
        payload: {
          metadata,
        },
      };
    },

    /**
     * company_codeと開始終了時刻でログを検索する
     */
    searchLogsByCompanyCode: async (
      companyCode: string,
      fromDateTime: string,
      toDateTime: string,
      index: string = "*",
    ) => {
      const apiClient = await apiClientFactory();
      // JSTの"Y-m-d H:i:s"形式の文字列をミリ秒タイムスタンプに変換
      const fromTs = parseJstDateTimeString(fromDateTime);
      const toTs = parseJstDateTimeString(toDateTime);

      return await safeCall(async () => {
        return await apiClient.post<DatadogLogSearchPayload>(
          "/logs/events/search",
          {
            filter: {
              // メッセージ内の文字列検索でcompany_codeを検索
              query: `"${companyCode}"`,
              from: new Date(fromTs).toISOString(),
              to: new Date(toTs).toISOString(),
              indexes: index === "*" ? [] : [index],
            },
            page: {
              limit: 1000,
            },
          },
        );
      });
    },
  };
};

/**
 * Datadog Monitor APIからモニターのクエリを取得し、ログ検索クエリに変換する
 *
 * モニタークエリの例:
 *   error-tracking("service:(order-sync-job OR order-sync) env:live").rollup("count").by("issue.id").last("1h") > 0
 *   logs("service:order-sync status:error").last("5m").rollup("count") > 0
 *
 * 上記から括弧内のフィルタ文字列を抽出し、error-trackingの場合は status:error を付与する
 */
const fetchLogQueryFromMonitor = async (
  apiClientFactory: () => Promise<ApiClientPort>,
  monitorId: string,
): Promise<string> => {
  const apiClient = await apiClientFactory();
  // Monitor APIはv1エンドポイントのため、baseURLを差し替え
  const v1Client = makeApiClient(
    apiClient.baseUrl.replace("/v2", "/v1"),
    apiClient.headers,
  );
  const response = await v1Client.get<DatadogMonitorPayload>(
    `/monitor/${monitorId}`,
  );
  const monitorQuery = response.data.query;

  return parseMonitorQueryToLogQuery(monitorQuery);
};

/**
 * モニタークエリからログ検索クエリを抽出する
 */
const parseMonitorQueryToLogQuery = (monitorQuery: string): string => {
  // error-tracking("...") or logs("...") の内側を抽出
  const match = monitorQuery.match(/(?:error-tracking|logs)\("(.+?)"\)/);
  if (!match) {
    // パースできない場合はそのまま返す
    return monitorQuery;
  }

  // Monitor APIのクエリ内ではダブルクォートが \"でエスケープされている
  // 例: logs("service:order-sync \"[error]\"") → 内側は service:order-sync \"[error]\"
  // ログ検索APIに渡す際はエスケープを解除する必要がある
  const innerQuery = (match[1] ?? "").replace(/\\$/, "").replace(/\\"/g, '"');

  // error-tracking の場合は status:error を付与
  if (monitorQuery.startsWith("error-tracking")) {
    return `${innerQuery} status:error`;
  }

  return innerQuery;
};

/**
 * JSTの"Y-m-d H:i:s"形式の文字列をミリ秒タイムスタンプに変換する
 */
const parseJstDateTimeString = (dateTimeString: string): number => {
  // "Y-m-d H:i:s"形式かどうかをチェック（例："2026-01-28 11:22:34"）
  const jstDateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!jstDateTimePattern.test(dateTimeString)) {
    throw new Error(
      `Invalid JST datetime format. Expected "Y-m-d H:i:s" format (e.g., "2026-01-28 11:22:34"), but got: ${dateTimeString}`,
    );
  }

  // JSTはUTC+9なので、文字列をJSTとして解釈してUTCのミリ秒タイムスタンプに変換
  // "2026-01-28 11:22:34" -> "2026-01-28T11:22:34+09:00"
  const jstIsoString = `${dateTimeString.replace(" ", "T")}+09:00`;
  const date = new Date(jstIsoString);

  if (isNaN(date.getTime())) {
    throw new Error(`Failed to parse datetime string: ${dateTimeString}`);
  }

  return date.getTime();
};
