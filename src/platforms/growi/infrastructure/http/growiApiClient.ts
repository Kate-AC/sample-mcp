import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { makeApiClient } from "@infrastructure/shared/apiClient";
import {
  GrowiConfig,
  loadGrowiConfig,
} from "../../domain/settings/growiConfig";
import { GrowiEnv, loadGrowiEnv } from "../env/growiEnv";

export const makeGrowiApiClient = (
  env: GrowiEnv = loadGrowiEnv(),
  config: GrowiConfig = loadGrowiConfig(),
): ApiClientPort => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    Authorization: `Bearer ${env.apiToken}`,
    // クッキーをそのまま使用（URLエンコードされた状態）
    Cookie: env.cookie.includes("connect.sid=")
      ? env.cookie
      : `connect.sid=${env.cookie}`,
  };

  return makeApiClient(config.baseUrl, headers);
};
