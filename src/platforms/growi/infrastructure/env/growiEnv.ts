import { getEnv } from "@infrastructure/shared/env";

export type GrowiEnv = {
  apiToken: string;
  cookie: string;
};

export function loadGrowiEnv(): GrowiEnv {
  const env: GrowiEnv = {
    apiToken: getEnv("GROWI_API_TOKEN"),
    cookie: getEnv("GROWI_COOKIE"),
  };

  // CookieまたはAPIトークンのどちらかが必須
  if (!env.apiToken && !env.cookie) {
    throw new Error("Growi apiToken or cookie is required");
  }

  return env;
}
