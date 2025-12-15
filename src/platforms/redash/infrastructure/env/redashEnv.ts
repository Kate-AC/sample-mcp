import { getEnv } from "@infrastructure/shared/env";

export type RedashEnv = {
  apiKey: string;
};

export function loadRedashEnv(): RedashEnv {
  const env: RedashEnv = {
    apiKey: getEnv("REDASH_API_KEY"),
  };

  if (!env.apiKey) {
    throw new Error("Redash apiKey is required");
  }

  return env;
}
