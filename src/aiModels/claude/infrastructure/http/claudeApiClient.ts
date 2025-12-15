import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { makeAiModelApiClient } from "@infrastructure/shared/aiModelApiClient";
import { loadClaudeEnv } from "../env/claudeEnv";

/**
 * Claude用のBedrock Runtime Clientを作成
 * 内部的にはAIモデル共通クライアントを使用
 */
export const makeClaudeApiClient = (
  env = loadClaudeEnv(),
): BedrockRuntimeClient => {
  return makeAiModelApiClient(env);
};
