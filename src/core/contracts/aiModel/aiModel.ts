import { AiModelFunction } from "./aiMocelFunction";
import { AiModelMetadata } from "./aiModelMetadata";
import { AiModelSetting } from "./aiModelSetting";

export interface AiModel<
  T extends Record<string, AiModelFunction> = Record<string, AiModelFunction>,
> {
  aiModelFunctions: T;
  aiModelMetadata: AiModelMetadata;
  aiModelSetting: AiModelSetting;
}
