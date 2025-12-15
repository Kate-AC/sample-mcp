import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import { loadSlackConfig } from "../../domain/settings/slackConfig";
import { loadSlackEnv } from "../env/slackEnv";

type SlackClientBase = "api" | "file";
type SlackContentType = "json" | "form" | undefined;

const makeSlackClient = (
  base: SlackClientBase,
  contentType: SlackContentType,
  useUserToken = true,
  config = loadSlackConfig(),
  env = loadSlackEnv(),
): ApiClientPort => {
  const token = useUserToken ? env.userOAuthToken : env.botUserOAuthToken;
  const baseUrl = base === "api" ? `${config.baseUrl}/api` : config.baseFileUrl;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType === "json") headers["Content-Type"] = "application/json";
  if (contentType === "form")
    headers["Content-Type"] =
      "application/x-www-form-urlencoded; charset=utf-8";

  return makeApiClient(baseUrl, headers);
};

export const makeSlackApiClient = (
  useUserToken = true,
  config = loadSlackConfig(),
  env = loadSlackEnv(),
): ApiClientPort => {
  return makeSlackClient("api", "json", useUserToken, config, env);
};

export const makeSlackFormApiClient = (
  useUserToken = true,
  config = loadSlackConfig(),
  env = loadSlackEnv(),
): ApiClientPort => {
  return makeSlackClient("api", "form", useUserToken, config, env);
};

export const makeSlackFileApiClient = (
  useUserToken = true,
  config = loadSlackConfig(),
  env = loadSlackEnv(),
): ApiClientPort => {
  return makeSlackClient("file", undefined, useUserToken, config, env);
};
