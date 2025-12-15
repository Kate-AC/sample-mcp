import { AiModelSetting } from "@core/contracts/aiModel/aiModelSetting";
import { loadTitanConfig } from "../domain/settings/titanConfig";
import { loadTitanEnv } from "../infrastructure/env/titanEnv";

export const makeTitanAiModelSetting = (): AiModelSetting => ({
  getConfig: async () => loadTitanConfig(),
  getEnv: async () => loadTitanEnv(),
});
