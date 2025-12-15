import { PlatformName } from "@core/mcpRegistry";

type ParsedToolUseRequest = {
  platformName: PlatformName;
  functionName: string;
};

/**
 * tool_useを解析してplatformNameとfunctionNameを返す
 */
export const parseToolUseRequest = (toolName: string): ParsedToolUseRequest => {
  const parts = toolName.split("_");

  if (parts.length < 2) {
    throw new Error(`Invalid tool name format: ${toolName}`);
  }

  return {
    platformName: parts[0] as PlatformName,
    functionName: parts.slice(1).join("_"),
  };
};
