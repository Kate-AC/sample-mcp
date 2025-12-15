/**
 * Datadogログイベントのペイロード型定義
 */
export type DatadogLogEventPayload = {
  id: string;
  type?: string;
  content?: string;
  attributes: {
    timestamp?: string;
    host?: string;
    service?: string;
    status?: string;
    message?: string;
    attributes?: {
      context?: {
        exception?: {
          code?: number;
          file?: string;
          message?: string;
          class?: string;
          trace?: string | string[];
          stack?: string | string[];
          previous?: {
            code?: number;
            file?: string;
            message?: string;
            class?: string;
            trace?: string | string[];
            stack?: string | string[];
            [key: string]: unknown;
          };
          [key: string]: unknown;
        };
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    tags?: string[];
    [key: string]: unknown;
  };
  tags?: string[];
  [key: string]: unknown;
};

/**
 * Datadogログ検索結果のペイロード型定義
 */
export type DatadogLogSearchPayload = {
  data: DatadogLogEventPayload[];
  meta: {
    page?: {
      after?: string;
    };
    status?: {
      [key: string]: number;
    };
    warnings?: Array<{
      code: string;
      message: string;
      detail: string;
    }>;
  };
  links?: {
    next?: string;
  };
};

/**
 * Datadogログ分析URLパラメータ
 */
export type DatadogLogAnalyticsUrlParams = {
  query: string;
  from_ts: number;
  to_ts: number;
  index?: string;
  live?: boolean;
  agg_m?: string;
  agg_t?: string;
  agg_q?: string;
  [key: string]: unknown;
};

/**
 * Datadog APMトレースのスパン情報
 */
export type DatadogTraceSpan = {
  spanID: number;
  traceID: number;
  parentID?: number;
  service: string;
  name: string;
  resource: string;
  startTime: number;
  endTime: number;
  duration: number;
  error?: number;
  type?: string;
  meta?: {
    "error.type"?: string;
    "error.message"?: string;
    "error.stack"?: string;
    "exception.type"?: string;
    "exception.message"?: string;
    "exception.stack"?: string;
    [key: string]: unknown;
  };
  metrics?: {
    [key: string]: number;
  };
  [key: string]: unknown;
};

/**
 * Datadog APMトレースのペイロード
 */
export type DatadogTracePayload = {
  data: {
    attributes: {
      spans: DatadogTraceSpan[];
      is_truncated?: boolean;
    };
    id: string;
    type: string;
  };
};

export type TraceMetadata = {
  duration?: number;
  ecs_task_arn?: string;
  env?: string;
  git?: {
    commit?: {
      sha?: string;
    };
    repository?: {
      id?: string;
    };
  };
  job?: {
    company_code?: string;
    ec_platform?: string;
    ec_platform_shop_id?: string;
    job_class?: string;
    job_group?: string;
    job_queue?: string;
    job_status_id?: string;
    opl_shop_id?: string;
    shop_id?: string;
    shop_name?: string;
  };
  language?: string;
  php?: {
    compilation?: {
      total_time_ms?: number;
    };
  };
  process_id?: string;
  version?: string;
  [key: string]: unknown;
};

/**
 * トレースメタデータ取得結果のペイロード
 */
export type TraceMetadataPayload = {
  metadata: TraceMetadata;
};

/**
 * Datadog Monitor APIレスポンスのペイロード
 * @see https://docs.datadoghq.com/api/latest/monitors/#get-a-monitor-s-details
 */
export type DatadogMonitorPayload = {
  id: number;
  name: string;
  type: string;
  query: string;
  message?: string;
  tags?: string[];
  [key: string]: unknown;
};
