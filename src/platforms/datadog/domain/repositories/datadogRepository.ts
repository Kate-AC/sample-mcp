import { Result } from "@core/result/result";
import {
  DatadogLogSearchPayload,
  TraceMetadataPayload,
} from "./datadogRepositoryPayload";

export interface DatadogRepository {
  /**
   * Datadogログを検索する
   * @param query ログ検索クエリ
   * @param limit 取得件数の上限（デフォルト: 100）
   */
  searchLogs: (
    query: string,
    limit?: number,
  ) => Promise<Result<DatadogLogSearchPayload>>;

  /**
   * Datadogログ分析URLからログを検索する
   * @param url Datadogログ分析URL
   */
  searchLogsFromUrl: (url: string) => Promise<Result<DatadogLogSearchPayload>>;

  /**
   * APMトレースのメタデータを取得する
   *
   * 注意: エンドポイントは`/trace/{trace_id}`だが、実際にはログから取得できるのは`span_id`のみ。
   * ただし、Datadog APIは`span_id`でも`trace_id`として受け付けるため、`span_id`を渡すことで取得可能。
   * ルートスパンの場合、`span_id`と`trace_id`が同じ値になることがある。
   *
   * @param spanId スパンID（ログのdd.span_id）
   */
  getTraceMetadataBySpanId: (
    spanId: string,
  ) => Promise<Result<TraceMetadataPayload>>;

  /**
   * company_codeと開始終了時刻でログを検索する
   * @param companyCode 会社コード
   * @param fromDateTime JSTの開始日時（"Y-m-d H:i:s"形式、例："2026-01-28 11:22:34"）
   * @param toDateTime JSTの終了日時（"Y-m-d H:i:s"形式、例："2026-01-28 11:27:34"）
   * @param index インデックス（デフォルト: "*"）
   */
  searchLogsByCompanyCode: (
    companyCode: string,
    fromDateTime: string,
    toDateTime: string,
    index?: string,
  ) => Promise<Result<DatadogLogSearchPayload>>;
}
