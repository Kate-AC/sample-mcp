import { AiModelSetting } from "@core/contracts/aiModel/aiModelSetting";
import {
  ClaudeConfig,
  loadClaudeConfig,
} from "../domain/settings/claudeConfig";
import { ClaudeEnv, loadClaudeEnv } from "../infrastructure/env/claudeEnv";

export type ClaudeAiModelSetting = AiModelSetting<ClaudeConfig, ClaudeEnv>;

export const makeClaudeAiModelSetting = (): ClaudeAiModelSetting => ({
  getConfig: async () => {
    return loadClaudeConfig();
  },
  getEnv: async () => {
    return loadClaudeEnv();
  },
});
