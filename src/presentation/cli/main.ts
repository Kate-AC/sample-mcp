#!/usr/bin/env node
import { aiModelRegistry } from "@core/aiModelRegistry";
import {
  findAiModelCommand,
  showAiModelHelp,
  showAllAiModelCommands,
  showClaudeToolUseSchema,
} from "./aiModelCommands";
import {
  findCommand,
  showAllPlatformCommands,
  showHelp,
  showMarkdownCommand,
  showPlatformHelp,
} from "./platformCommands";

/**
 * CLIエントリーポイント
 */
const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const isJsonOutput = process.env["JSON_OUTPUT"] === "true";

  if (!isJsonOutput) {
    console.log("CLI main called with args:", args);
  }

  if (args.length === 0) {
    showHelp();
    return;
  }

  const commandName = args[0];
  const commandArgs = args.slice(1);

  if (!isJsonOutput) {
    console.log("Command name:", commandName, "Command args:", commandArgs);
  }

  // helpコマンドをチェック (例: help faq, help claude)
  if (
    commandName === "help" ||
    commandName === "--help" ||
    commandName === "-h"
  ) {
    // プラットフォーム/AIモデル指定がある場合
    if (args.length === 2 && args[1]) {
      const target = args[1];

      // AIモデルのリストを取得
      const registry = aiModelRegistry();
      const aiModelNames = registry.getAllAiModelNames();

      // AIモデルとして存在するかチェック
      if (aiModelNames.includes(target as any)) {
        showAiModelHelp(target);
        return;
      }

      // プラットフォームとして表示を試みる
      showPlatformHelp(target);
      return;
    }
    // プラットフォーム指定がない場合は全体のヘルプ
    showHelp();
    return;
  }

  if (commandName === "all-commands") {
    showAllPlatformCommands();
    console.log("\n");
    showAllAiModelCommands();
    return;
  }

  if (commandName === "show-markdown") {
    await showMarkdownCommand(commandArgs);
    return;
  }

  if (commandName === "show-tool-schema") {
    showClaudeToolUseSchema();
    return;
  }

  // 通常のコマンドを実行（platformコマンドまたはaiModelコマンド）
  const platformCommand = commandName ? findCommand(commandName) : undefined;
  const aiModelCommand =
    !platformCommand && commandName
      ? findAiModelCommand(commandName)
      : undefined;
  const command = platformCommand || aiModelCommand;

  if (!isJsonOutput) {
    console.log("Found command:", command?.name);
  }

  if (!command) {
    console.error(`不明なコマンド: ${commandName || "undefined"}`);
    console.error(
      "\nヒント: 'npm run cli help [platform|aimodel]' でコマンド一覧を表示",
    );
    console.error("例: npm run cli help faq");
    console.error("例: npm run cli help claude");
    process.exit(1);
  }

  try {
    if (!isJsonOutput) {
      console.log("Executing command with args:", commandArgs);
    }
    await command.execute(commandArgs);
  } catch (error) {
    console.error("コマンド実行中にエラーが発生しました:", error);
    process.exit(1);
  }
};

// CLI実行
const isJsonOutput = process.env["JSON_OUTPUT"] === "true";

if (!isJsonOutput) {
  console.log(
    "CLI script loaded, require.main === module:",
    require.main === module,
  );
}

// スクリプトが直接実行された場合のみmain()を呼び出し
if (require.main === module) {
  if (!isJsonOutput) {
    console.log("Calling main()...");
  }
  main().catch((error) => {
    console.error("予期しないエラーが発生しました:", error);
    process.exit(1);
  });
} else {
  if (!isJsonOutput) {
    console.log("Not main module, calling main() directly...");
  }
  main().catch((error) => {
    console.error("予期しないエラーが発生しました:", error);
    process.exit(1);
  });
}
