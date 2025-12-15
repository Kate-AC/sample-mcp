import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";
import { PlatformName, getMcp as getMcpFromRegistry } from "@core/mcpRegistry";
import { ErrorType, Result } from "@core/result/result";

// 型定義
export type McpArg =
  | string
  | number
  | boolean
  | Record<string, any>
  | undefined;

export type McpCallRequest = {
  platform: PlatformName;
  funcName: string;
  args: McpArg[];
};

export type McpCallResponse<T> = {
  platform: PlatformName;
  funcName: string;
  result: Result<T>;
  timestamp: Date;
};

export const call = async <T>(
  request: McpCallRequest,
): Promise<McpCallResponse<T>> => {
  const { platform, funcName, args } = request;
  const isJsonOutput = process.env["JSON_OUTPUT"] === "true";

  try {
    if (!isJsonOutput) {
      console.log("platformHandler.call called with:", {
        platform,
        funcName,
        args,
      });
    }
    const mcp = getMcp(platform);
    if (!isJsonOutput) {
      console.log("mcp obtained:", Object.keys(mcp));
    }
    const mcpFunc = mcp.mcpFunctions[funcName] as McpFunction<T>;

    if (!mcpFunc || typeof mcpFunc !== "function") {
      throw new Error(
        `Method '${funcName}' is not available on platform '${platform}'`,
      );
    }

    if (!isJsonOutput) {
      console.log("calling mcpFunc with args:", args);
    }
    const result = await mcpFunc(...args);

    return {
      platform,
      funcName,
      result,
      timestamp: new Date(),
    };
  } catch (error) {
    const errorResult: Result<T> = {
      payload: null as T,
      status: 500,
      isSuccess: false,
      message: error instanceof Error ? error.message : String(error),
      errorType: ErrorType.OTHER_ERROR,
    };

    return {
      platform,
      funcName,
      result: errorResult,
      timestamp: new Date(),
    };
  }
};

export const getMcp = (platform: PlatformName): Mcp => {
  return getMcpFromRegistry(platform);
};

export const getMetadata = (platform: PlatformName): McpMetadata => {
  return getMcpFromRegistry(platform).mcpMetadata;
};

export const getEnv = async (platform: PlatformName) => {
  return getMcpFromRegistry(platform).mcpSetting.getEnv();
};
