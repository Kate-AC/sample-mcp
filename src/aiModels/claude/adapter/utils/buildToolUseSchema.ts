import type { McpRegistry } from "@core/mcpRegistry";
import type { ClaudeToolUseSchema } from "../../domain/repositories/claudeRepositoryRequestPayload";

/**
 * MCPのメタデータからClaudeで使用するToolUseスキーマを生成
 */
export const buildToolUseSchema = (
  mcpRegistry: McpRegistry,
): ClaudeToolUseSchema[] => {
  return mcpRegistry.getAllMcpNames().flatMap((mcpName) => {
    const mcp = mcpRegistry.getMcp(mcpName);
    const metadata = mcp.mcpMetadata;
    const commands = metadata.getCommands();

    return commands.map((cmd): ClaudeToolUseSchema => {
      // usageから関数名を抽出: "npm run cli platform:function" -> "platform_function"
      const usageMatch = cmd.usage.match(/npm run cli (\w+):(\w+)/);
      if (!usageMatch) {
        throw new Error(`Invalid usage format: ${cmd.usage}`);
      }

      const [, platformName, functionName] = usageMatch;
      const toolName = `${platformName}_${functionName}`;

      // commandフィールドから引数を解析: "functionName <required> [optional]"
      // 例: "getIssue <issueId> [queryParams]" → [issueId(必須), queryParams(任意)]
      const commandWithoutName = cmd.command.replace(/^\w+\s*/, "");

      // 引数を抽出: <> は必須、[] はオプション
      const argMatches = Array.from(
        commandWithoutName.matchAll(/<([^>]+)>|\[([^\]]+)\]/g),
      );

      const properties: Record<string, any> = {};
      const required: string[] = [];

      argMatches.forEach((match) => {
        const isRequired = match[1] !== undefined; // <> なら必須
        const argName = match[1] || match[2]; // 引数名

        if (!argName) return;

        // "searchQuery|queryParams" のようなOR形式の場合、最初のオプションを使う
        const finalArgName = argName.includes("|")
          ? argName.split("|")[0]
          : argName;

        if (!finalArgName) return;

        // プロパティ定義を追加
        properties[finalArgName] = {
          type: "string",
          description: argName.includes("|")
            ? `${argName.split("|").join(" or ")}`
            : `${argName} parameter`,
        };

        // 必須パラメータリストに追加
        if (isRequired) {
          required.push(finalArgName);
        }
      });

      return {
        name: toolName,
        description: cmd.description,
        input_schema: {
          type: "object",
          properties,
          ...(required.length > 0 && { required }),
        },
      };
    });
  });
};
