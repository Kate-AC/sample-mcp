import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { loadFigmaConfig } from "@platforms/figma/domain/settings/figmaConfig";
import { loadFigmaEnv } from "@platforms/figma/infrastructure/env/figmaEnv";
import { makeApiClient } from "@infrastructure/shared/apiClient";

export const makeFigmaApiClient = (
  config = loadFigmaConfig(),
  env = loadFigmaEnv(),
): ApiClientPort => {
  const headers: Record<string, string> = {
    "X-Figma-Token": env.apiToken,
    "Content-Type": "application/json",
  };

  return makeApiClient(config.baseUrl, headers);
};
