import { getEnv } from "@infrastructure/shared/env";

export type DatadogEnv = {
  apiKey: string;
  applicationKey: string;
};

export const loadDatadogEnv = (): DatadogEnv => {
  const env: DatadogEnv = {
    apiKey: getEnv("DATADOG_API_KEY"),
    applicationKey: getEnv("DATADOG_APPLICATION_KEY"),
  };

  if (!env.apiKey) {
    throw new Error("Datadog apiKey is required");
  }
  if (!env.applicationKey) {
    throw new Error("Datadog applicationKey is required");
  }

  return env;
};
