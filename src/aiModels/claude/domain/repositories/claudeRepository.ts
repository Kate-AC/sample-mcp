import {
  AiGenerateOptions,
  AiJsonPayload,
  AiTextPayload,
} from "@core/contracts/aiModel/aiModelPayload";
import { Result } from "@core/result/result";
import { ClaudeExtendedTextPayload } from "./claudeExtendedPayload";
import {
  ClaudeMessage,
  ClaudeToolUseSchema,
} from "./claudeRepositoryRequestPayload";

export interface ClaudeRepository {
  ask: (
    messages: ClaudeMessage[],
    tools?: ClaudeToolUseSchema[],
    options?: AiGenerateOptions,
  ) => Promise<Result<AiTextPayload | ClaudeExtendedTextPayload>>;
  askJson: (
    messages: ClaudeMessage[],
    tools?: ClaudeToolUseSchema[],
    options?: AiGenerateOptions,
  ) => Promise<Result<AiJsonPayload>>;
}
