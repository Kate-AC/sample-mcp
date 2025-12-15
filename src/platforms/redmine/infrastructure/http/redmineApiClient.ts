import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import { loadRedmineConfig } from "../../domain/settings/redmineConfig";
import { loadRedmineEnv } from "../env/redmineEnv";

export const makeRedmineApiClient = (
  redmineConfig = loadRedmineConfig(),
  redmineEnv = loadRedmineEnv(),
): ApiClientPort => {
  return makeApiClient(redmineConfig.baseUrl, {
    "Content-Type": "application/json",
    "X-Redmine-API-Key": redmineEnv.apiKey,
  });
};
