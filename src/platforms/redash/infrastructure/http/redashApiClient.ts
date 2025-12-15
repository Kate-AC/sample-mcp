import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import { loadRedashConfig } from "../../domain/settings/redashConfig";
import { loadRedashEnv } from "../env/redashEnv";

export const makeRedashApiClient = (): ApiClientPort => {
  const config = loadRedashConfig();
  const env = loadRedashEnv();
  return makeApiClient(config.baseUrl, {
    "Content-Type": "application/json",
    Authorization: `Key ${env.apiKey}`,
  });
};
