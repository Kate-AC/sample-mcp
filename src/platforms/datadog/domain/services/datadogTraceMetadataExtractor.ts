import {
  DatadogTracePayload,
  DatadogTraceSpan,
  TraceMetadata,
} from "../repositories/datadogRepositoryPayload";

/**
 * APMトレースからメタデータを抽出する
 */
export const extractMetadataFromTrace = (
  trace: DatadogTracePayload,
): TraceMetadata => {
  const spans = trace.data?.attributes?.spans || [];

  // ルートスパン（parentIDがないスパン）を探す
  const rootSpan = spans.find((span) => !span.parentID);

  if (!rootSpan) {
    return {};
  }

  return extractMetadataFromSpan(rootSpan);
};

/**
 * スパンからメタデータを抽出する
 */
export const extractMetadataFromSpan = (
  span: DatadogTraceSpan,
): TraceMetadata => {
  const meta = span.meta || {};

  // span.metaをそのまま返し、durationだけ追加
  return {
    ...meta,
    duration: span.duration,
  } as TraceMetadata;
};
