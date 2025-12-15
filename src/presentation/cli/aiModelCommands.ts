import { buildToolUseSchema } from "../../aiModels/claude/adapter/utils/buildToolUseSchema";
import { AiModelName, aiModelRegistry } from "../../core/aiModelRegistry";
import { mcpRegistry } from "../../core/mcpRegistry";

/**
 * AIモデルコマンドの定義
 */
export type AiModelCommand = {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<void>;
};

/**
 * 各AIモデルのメタデータからコマンドを動的に生成
 */
const createAiModelCommands = (): AiModelCommand[] => {
  const registry = aiModelRegistry();
  const aiModels = registry.getAllAiModels();
  const aiModelNames = registry.getAllAiModelNames();
  const commands: AiModelCommand[] = [];

  aiModels.forEach((aiModel, index) => {
    const modelName = aiModelNames[index];
    if (!modelName) return;

    const functions = aiModel.aiModelMetadata.getFunctions();

    functions.forEach((func) => {
      commands.push({
        name: `${modelName}:${func.functionName}`,
        description: `[${modelName}] ${func.description}`,
        execute: async (args: string[]) => {
          const isJsonOutput = process.env["JSON_OUTPUT"] === "true";

          if (!isJsonOutput) {
            console.log(`\n実行中: ${modelName}:${func.functionName}`);
            console.log(`引数: ${args.join(", ") || "(なし)"}\n`);
          }

          try {
            const model = registry.useAiModel(modelName as AiModelName);
            const repository = model.aiModelFunctions as any;
            const functionToCall = repository[func.functionName];

            if (typeof functionToCall !== "function") {
              throw new Error(`関数 '${func.functionName}' が見つかりません`);
            }

            // 簡易的なメッセージ構築（claude:ask, claude:askJson用）
            if (func.functionName === "ask") {
              const userMessage = args[0] || "こんにちは";
              const messages = [
                {
                  role: "user" as const,
                  content: userMessage,
                },
              ];

              const response = await functionToCall(messages);

              if (isJsonOutput) {
                console.log(JSON.stringify(response));
              } else {
                if (response.isSuccess) {
                  console.log("✅ 成功\n");
                  console.log("応答:");
                  const content = response.payload?.content;
                  if (Array.isArray(content)) {
                    content.forEach((c: any) => {
                      if (c.type === "text") {
                        console.log(c.text);
                      }
                    });
                  }
                  console.log("\n詳細:");
                  console.log(JSON.stringify(response.payload, null, 2));
                } else {
                  console.error("❌ エラー");
                  console.error("メッセージ:", response.message);
                  if (response.payload) {
                    console.error(
                      "詳細:",
                      JSON.stringify(response.payload, null, 2),
                    );
                  }
                }
              }
            } else if (func.functionName === "askJson") {
              const userMessage = args[0] || "こんにちは";
              const messages = [
                {
                  role: "user" as const,
                  content: userMessage,
                },
              ];

              const response = await functionToCall(messages);

              if (isJsonOutput) {
                console.log(JSON.stringify(response));
              } else {
                if (response.isSuccess) {
                  console.log("✅ 成功\n");

                  if (func.functionName === "askJson") {
                    // askJsonの場合はJSON形式で表示
                    console.log("JSON応答:");
                    console.log(JSON.stringify(response.payload, null, 2));
                  } else {
                    // askの場合はテキストを表示（Vercel AI SDK統一形式）
                    console.log("応答:");
                    console.log(response.payload.text);

                    console.log("\n詳細:");
                    console.log(JSON.stringify(response.payload, null, 2));
                  }
                } else {
                  console.error("❌ エラー");
                  console.error("メッセージ:", response.message);
                  if (response.payload) {
                    console.error(
                      "詳細:",
                      JSON.stringify(response.payload, null, 2),
                    );
                  }
                }
              }
            } else {
              // その他の関数の場合
              const response = await functionToCall(...args);

              if (isJsonOutput) {
                console.log(JSON.stringify(response));
              } else {
                if (response.isSuccess) {
                  console.log("✅ 成功\n");
                  console.log(JSON.stringify(response.payload, null, 2));
                } else {
                  console.error("❌ エラー");
                  console.error(response.message);
                }
              }
            }
          } catch (error) {
            if (isJsonOutput) {
              console.log(
                JSON.stringify({
                  modelName,
                  functionName: func.functionName,
                  result: {
                    isSuccess: false,
                    message:
                      error instanceof Error ? error.message : String(error),
                    payload: null,
                  },
                }),
              );
            } else {
              console.error("❌ 実行失敗:");
              console.error(error);
            }
          }
        },
      });
    });
  });

  return commands;
};

export const aiModelCommands: AiModelCommand[] = createAiModelCommands();

/**
 * コマンド名からコマンドを検索
 */
export const findAiModelCommand = (
  name: string,
): AiModelCommand | undefined => {
  return aiModelCommands.find((cmd) => cmd.name === name);
};

/**
 * AIモデル別のコマンド一覧を表示
 */
export const showAiModelHelp = (modelName: string): void => {
  const registry = aiModelRegistry();
  const aiModels = registry.getAllAiModels();
  const aiModelNames = registry.getAllAiModelNames();
  const modelIndex = aiModelNames.findIndex((name) => name === modelName);

  if (modelIndex === -1 || !aiModels[modelIndex]) {
    console.error(`AIモデル '${modelName}' が見つかりません`);
    console.error("\n利用可能なAIモデル:");
    aiModelNames.forEach((name) => {
      console.error(`  ${name}`);
    });
    return;
  }

  const aiModel = aiModels[modelIndex];
  const metadata = aiModel.aiModelMetadata;

  console.log(`\n=== ${modelName.toUpperCase()} ===\n`);
  console.log("概要:");
  metadata.getSummary().forEach((line) => {
    console.log(`  ${line}`);
  });

  console.log("\n使用コンテキスト:");
  metadata.getUsageContext().forEach((line) => {
    console.log(`  - ${line}`);
  });

  console.log("\n利用可能な関数:");
  metadata.getFunctions().forEach((func) => {
    console.log(`  ${modelName}:${func.functionName}`);
    console.log(`    説明: ${func.description}`);
    console.log(`    使用例: ${func.usage}`);
  });

  const securityRules = metadata.getSecurityRules();
  if (securityRules.length > 0) {
    console.log("\nセキュリティルール:");
    securityRules.forEach((rule) => {
      console.log(`  - ${rule}`);
    });
  }

  console.log("");
};

/**
 * 全AIモデルのコマンド一覧を表示
 */
export const showAllAiModelCommands = (): void => {
  const registry = aiModelRegistry();
  const aiModelNames = registry.getAllAiModelNames();

  console.log("# 全AIモデルのコマンド一覧");
  console.log("");

  aiModelNames.forEach((modelName) => {
    showAiModelHelp(modelName);
    console.log("---");
    console.log("");
  });
};

/**
 * Claude Tool Useスキーマを表示
 */
export const showClaudeToolUseSchema = (): void => {
  const registry = mcpRegistry();
  const tools = buildToolUseSchema(registry);

  console.log("# Claude Tool Use Schema");
  console.log("");
  console.log(`Total tools: ${tools.length}`);
  console.log("");
  console.log(JSON.stringify(tools, null, 2));
};
