import { getEnv } from "@infrastructure/shared/env";

export type RedmineEnv = {
  apiKey: string;
};

export function loadRedmineEnv(): RedmineEnv {
  const env: RedmineEnv = {
    apiKey: getEnv("REDMINE_API_KEY"),
  };

  if (!env.apiKey) {
    throw new Error("Redmine apiKey is required");
  }

  return env;
}
