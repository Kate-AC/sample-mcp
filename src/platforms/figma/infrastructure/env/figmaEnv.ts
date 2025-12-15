import { getEnv } from "@infrastructure/shared/env";

export type FigmaEnv = {
  apiToken: string;
};

export const loadFigmaEnv = (): FigmaEnv => {
  return {
    apiToken: getEnv("FIGMA_API_TOKEN"),
  };
};
