import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { loadDatadogConfig } from "@platforms/datadog/domain/settings/datadogConfig";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import { loadDatadogEnv } from "../env/datadogEnv";

/**
 * Datadog API用のクライアントを作成
 */
export const makeDatadogApiClient = async (): Promise<ApiClientPort> => {
  const config = loadDatadogConfig();
  const env = loadDatadogEnv();

  return makeApiClient(config.baseUrl, {
    "Content-Type": "application/json",
    "DD-API-KEY": env.apiKey,
    "DD-APPLICATION-KEY": env.applicationKey,
  });
};
