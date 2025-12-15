export type DatadogConfig = {
  /** Datadog APIベースURL（例: https://api.datadoghq.com/api/v2） */
  baseUrl: string;
};

export const loadDatadogConfig = (): DatadogConfig => {
  return {
    baseUrl: "https://api.datadoghq.com/api/v2",
  };
};
