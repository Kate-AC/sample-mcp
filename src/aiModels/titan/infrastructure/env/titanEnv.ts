import { AiModelEnv, loadAiModelEnv } from "@infrastructure/shared/aiModelEnv";

/**
 * Titan用の環境変数型（AIモデル共通環境変数のエイリアス）
 */
export type TitanEnv = AiModelEnv;

/**
 * Titan用の環境変数を読み込む（内部的にはAIモデル共通環境変数を使用）
 */
export function loadTitanEnv(): TitanEnv {
  return loadAiModelEnv();
}
