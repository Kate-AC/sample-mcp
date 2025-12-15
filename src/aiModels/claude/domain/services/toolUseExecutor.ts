import { getMcp } from "@core/mcpRegistry";
import { Result } from "@core/result/result";
import { ClaudeToolUseRequestContent } from "../repositories/claudeRepositoryRequestPayload";
import { parseToolUseRequest } from "./toolUseRequestParser";

/**
 * tool_useを実行して結果を返す
 */
export const executeToolUse = async (
  toolUseRequest: ClaudeToolUseRequestContent,
): Promise<Result<unknown>> => {
  const { platformName, functionName } = parseToolUseRequest(
    toolUseRequest.name,
  );

  const mcp = getMcp(platformName);

  const func = mcp.mcpFunctions[functionName];
  if (typeof func !== "function") {
    throw new Error(`Unknown function: ${platformName}:${functionName}`);
  }

  const args = Object.values(toolUseRequest.input);

  return await func(...args);
};
