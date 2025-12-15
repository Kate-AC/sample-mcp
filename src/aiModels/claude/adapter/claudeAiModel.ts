import { AiModelFunction } from "@core/contracts/aiModel/aiMocelFunction";
import { AiModel } from "@core/contracts/aiModel/aiModel";
import {
  AiGenerateOptions,
  AiJsonPayload,
  AiTextPayload,
} from "@core/contracts/aiModel/aiModelPayload";
import { ClaudeExtendedTextPayload } from "../domain/repositories/claudeExtendedPayload";
import {
  ClaudeMessage,
  ClaudeToolUseSchema,
} from "../domain/repositories/claudeRepositoryRequestPayload";
import { makeClaudeRepository } from "../infrastructure/repositories/claudeRepository";
import { makeClaudeAiModelMetadata } from "./claudeAiModelMetadata";
import { makeClaudeAiModelSetting } from "./claudeAiModelSetting";

export type ClaudeAiModelFunctions = {
  ask: AiModelFunction<
    AiTextPayload | ClaudeExtendedTextPayload,
    [ClaudeMessage[], ClaudeToolUseSchema[]?, AiGenerateOptions?]
  >;
  askJson: AiModelFunction<
    AiJsonPayload,
    [ClaudeMessage[], ClaudeToolUseSchema[]?, AiGenerateOptions?]
  >;
};

export const makeClaudeAiModel = ({
  claudeRepositoryFactory = makeClaudeRepository(),
  claudeAiModelMetadata = makeClaudeAiModelMetadata(),
  claudeAiModelSetting = makeClaudeAiModelSetting(),
} = {}): AiModel<ClaudeAiModelFunctions> => ({
  aiModelFunctions: {
    ask: async (messages, tools, options) => {
      return await claudeRepositoryFactory.ask(messages, tools, options);
    },
    askJson: async (messages, tools, options) => {
      return await claudeRepositoryFactory.askJson(messages, tools, options);
    },
  },
  aiModelMetadata: claudeAiModelMetadata,
  aiModelSetting: claudeAiModelSetting,
});
