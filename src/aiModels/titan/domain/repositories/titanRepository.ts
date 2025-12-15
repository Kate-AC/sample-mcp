import {
  AiGenerateOptions,
  AiJsonPayload,
  AiTextPayload,
} from "@core/contracts/aiModel/aiModelPayload";
import { Result } from "@core/result/result";
import {
  TitanEmbeddingsContext,
  TitanMessage,
} from "./titanRepositoryRequestPayload";

export interface TitanRepository {
  ask: (
    messages: TitanMessage[],
    embeddings?: TitanEmbeddingsContext,
    options?: AiGenerateOptions,
  ) => Promise<Result<AiTextPayload>>;
  askJson: (
    messages: TitanMessage[],
    embeddings?: TitanEmbeddingsContext,
    options?: AiGenerateOptions,
  ) => Promise<Result<AiJsonPayload>>;
  embed: (text: string) => Promise<number[]>;
  embedBatch: (texts: string[]) => Promise<number[][]>;
}
