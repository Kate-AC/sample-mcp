import { AiModelFunction } from "@core/contracts/aiModel/aiMocelFunction";
import { AiModel } from "@core/contracts/aiModel/aiModel";
import {
  AiGenerateOptions,
  AiJsonPayload,
  AiTextPayload,
} from "@core/contracts/aiModel/aiModelPayload";
import {
  TitanEmbeddingsContext,
  TitanMessage,
} from "../domain/repositories/titanRepositoryRequestPayload";
import { makeTitanRepository } from "../infrastructure/repositories/titanRepository";
import { makeTitanAiModelMetadata } from "./titanAiModelMetadata";
import { makeTitanAiModelSetting } from "./titanAiModelSetting";

export type TitanAiModelFunctions = {
  ask: AiModelFunction<
    AiTextPayload,
    [TitanMessage[], TitanEmbeddingsContext?, AiGenerateOptions?]
  >;
  askJson: AiModelFunction<
    AiJsonPayload,
    [TitanMessage[], TitanEmbeddingsContext?, AiGenerateOptions?]
  >;
};

export const makeTitanAiModel = (
  repositoryFactory = makeTitanRepository(),
  metadataFactory = makeTitanAiModelMetadata(),
  settingFactory = makeTitanAiModelSetting(),
): AiModel<TitanAiModelFunctions> => {
  return {
    aiModelFunctions: {
      ask: async (
        messages: TitanMessage[],
        embeddings?: TitanEmbeddingsContext,
      ) => {
        return await repositoryFactory.ask(messages, embeddings);
      },
      askJson: async (
        messages: TitanMessage[],
        embeddings?: TitanEmbeddingsContext,
      ) => {
        return await repositoryFactory.askJson(messages, embeddings);
      },
    },
    aiModelMetadata: metadataFactory,
    aiModelSetting: settingFactory,
  };
};
