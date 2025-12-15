import { makeClaudeAiModel } from "../aiModels/claude/adapter/claudeAiModel";
import { AiModel } from "./contracts/aiModel/aiModel";

const AI_MODELS = {
  claude: makeClaudeAiModel(),
} as const;

export type AiModelName = keyof typeof AI_MODELS;

// 関数オーバーロードで型安全性を確保
export function useAiModel(
  modelName: "claude",
): ReturnType<typeof makeClaudeAiModel>;
export function useAiModel(modelName: AiModelName): AiModel;
export function useAiModel(modelName: AiModelName): AiModel {
  const model = AI_MODELS[modelName];

  if (!model) {
    throw new Error(`AI Model '${modelName}' is not supported`);
  }

  return model;
}

// AI Model 固有の型をエクスポート
export type ClaudeAiModel = ReturnType<typeof makeClaudeAiModel>;

export const getAllAiModels = (): AiModel[] => {
  return Object.values(AI_MODELS);
};

export const getAllAiModelNames = (): AiModelName[] => {
  return Object.keys(AI_MODELS) as AiModelName[];
};

export type AiModelRegistry = {
  useAiModel: typeof useAiModel;
  getAllAiModels: typeof getAllAiModels;
  getAllAiModelNames: typeof getAllAiModelNames;
};

export const aiModelRegistry = (): AiModelRegistry => ({
  useAiModel,
  getAllAiModels,
  getAllAiModelNames,
});
