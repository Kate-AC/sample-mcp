import { McpFunction } from "./mcpFunction";
import { McpMetadata } from "./mcpMetadata";
import { McpSetting } from "./mcpSetting";

export interface Mcp<
  T extends Record<string, McpFunction> = Record<string, McpFunction>,
> {
  mcpFunctions: T;
  mcpMetadata: McpMetadata;
  mcpSetting: McpSetting;
}
