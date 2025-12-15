import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { makeAiModelApiClient } from "@infrastructure/shared/aiModelApiClient";
import { loadTitanEnv } from "../env/titanEnv";

/**
 * Titan用のBedrock Runtime Clientを作成
 * 内部的にはAIモデル共通クライアントを使用
 */
export const makeTitanApiClient = (
  env = loadTitanEnv(),
): BedrockRuntimeClient => {
  return makeAiModelApiClient(env);
};
