import { AiModelEnv, loadAiModelEnv } from "@infrastructure/shared/aiModelEnv";

/**
 * Claude用の環境変数型（AIモデル共通環境変数のエイリアス）
 */
export type ClaudeEnv = AiModelEnv;

/**
 * Claude用の環境変数を読み込む（内部的にはAIモデル共通環境変数を使用）
 */
export function loadClaudeEnv(): ClaudeEnv {
  return loadAiModelEnv();
}
