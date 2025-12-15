import { getEnv } from "@infrastructure/shared/env";

export type LocalEnv = {
  sourceBasePath: string;
};

export function loadLocalEnv(): LocalEnv {
  const env: LocalEnv = {
    sourceBasePath: getEnv("LOCAL_SOURCE_BASE_PATH", "/"),
  };

  return env;
}
