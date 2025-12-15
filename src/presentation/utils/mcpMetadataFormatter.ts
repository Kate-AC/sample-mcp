import { McpMetadata } from "../../core/contracts/mcp/mcpMetadata";

/**
 * 単一のMcpMetadataをMarkdown形式でフォーマット
 */
export const formatToMarkdown = (
  metadata: McpMetadata,
  platformName: string,
): string => {
  const lines: string[] = [];

  // ヘッダー
  lines.push(`# ${platformName} MCP`);
  lines.push("");

  // 概要
  lines.push("## 概要");
  const summary = metadata.getSummary();
  if (summary.length > 0) {
    lines.push(summary.join(" "));
  } else {
    lines.push("*概要情報なし*");
  }
  lines.push("");

  // 使用場面
  lines.push("## 使用場面");
  const usageContext = metadata.getUsageContext();
  if (usageContext.length > 0) {
    usageContext.forEach((context) => {
      lines.push(`- ${context}`);
    });
  } else {
    lines.push("*使用場面情報なし*");
  }
  lines.push("");

  // 利用可能なコマンド
  lines.push("## 利用可能なコマンド");
  const commands = metadata.getCommands();
  if (commands.length > 0) {
    commands.forEach((cmd) => {
      lines.push(`### ${cmd.command}`);
      lines.push("");
      lines.push(`**説明:** ${cmd.description}`);
      lines.push("");
      lines.push(`**使用方法:**`);
      lines.push("```");
      lines.push(cmd.usage);
      lines.push("```");
      lines.push("");
    });
  } else {
    lines.push("*利用可能なコマンドなし*");
  }

  // 禁止事項
  const securityRules = metadata.getSecurityRules();
  if (securityRules.length > 0) {
    lines.push("## セキュリティルール");
    lines.push("");
    lines.push("以下の操作は禁止されています:");
    lines.push("");
    securityRules.forEach((rule) => {
      lines.push(`- ${rule}`);
    });
    lines.push("");
  }

  // フッター
  lines.push("---");
  lines.push(`*最終更新: ${new Date().toLocaleString("ja-JP")}*`);

  return lines.join("\n");
};

/**
 * 単一のMcpMetadataをプレーンテキスト形式でフォーマット（AI可読用）
 */
export const formatToPlainText = (
  metadata: McpMetadata,
  platformName: string,
): string => {
  const lines: string[] = [];

  // ヘッダー
  lines.push(`# ${platformName.toUpperCase()} Platform`);
  lines.push("");

  // 概要
  lines.push("## 概要");
  const summary = metadata.getSummary();
  if (summary.length > 0) {
    lines.push(summary.join(" "));
  } else {
    lines.push("概要情報なし");
  }
  lines.push("");

  // 使用場面
  lines.push("## 使用場面");
  const usageContext = metadata.getUsageContext();
  if (usageContext.length > 0) {
    usageContext.forEach((context) => {
      lines.push(`- ${context}`);
    });
  } else {
    lines.push("使用場面情報なし");
  }
  lines.push("");

  // 利用可能なコマンド
  lines.push("## 利用可能なコマンド");
  const commands = metadata.getCommands();
  if (commands.length > 0) {
    commands.forEach((cmd, index) => {
      lines.push(`${index + 1}. ${cmd.command}`);
      lines.push(`   説明: ${cmd.description}`);
      lines.push(`   使用方法: ${cmd.usage}`);
      lines.push("");
    });
  } else {
    lines.push("利用可能なコマンドなし");
    lines.push("");
  }

  // 禁止事項
  const securityRules = metadata.getSecurityRules();
  if (securityRules.length > 0) {
    lines.push("## セキュリティルール");
    lines.push("以下の操作は禁止されています:");
    securityRules.forEach((rule) => {
      lines.push(`- ${rule}`);
    });
    lines.push("");
  }

  return lines.join("\n");
};

/**
 * 複数のMcpMetadataをMarkdown形式でフォーマット
 */
export const formatMultipleToMarkdown = (
  metadataList: Array<{ metadata: McpMetadata; platformName: string }>,
): string => {
  const lines: string[] = [];

  // メインヘッダー
  lines.push("# プラットフォーム MCP 一覧");
  lines.push("");
  lines.push(`利用可能なプラットフォーム数: ${metadataList.length}`);
  lines.push("");

  // 目次
  if (metadataList.length > 0) {
    lines.push("## 目次");
    lines.push("");
    metadataList.forEach(({ platformName }) => {
      lines.push(`- [${platformName}](#${platformName.toLowerCase()}-mcp)`);
    });
    lines.push("");
  }

  // 各プラットフォームの詳細
  metadataList.forEach(({ metadata, platformName }) => {
    const formatted = formatToMarkdown(metadata, platformName);
    lines.push(formatted);
    lines.push("");
  });

  return lines.join("\n");
};

/**
 * Markdownをコンソールに出力
 */
export const printToConsole = (
  metadata: McpMetadata,
  platformName: string,
): void => {
  const markdown = formatToMarkdown(metadata, platformName);
  console.log(markdown);
};

/**
 * 複数のMarkdownをコンソールに出力
 */
export const printMultipleToConsole = (
  metadataList: Array<{ metadata: McpMetadata; platformName: string }>,
): void => {
  const markdown = formatMultipleToMarkdown(metadataList);
  console.log(markdown);
};

/**
 * Markdownをファイルに保存
 */
export const saveToFile = async (
  metadata: McpMetadata,
  platformName: string,
  filePath: string,
): Promise<void> => {
  const fs = await import("fs/promises");
  const markdown = formatToMarkdown(metadata, platformName);
  await fs.writeFile(filePath, markdown, "utf-8");
  console.log(`Markdownファイルを保存しました: ${filePath}`);
};

/**
 * 複数のMarkdownをファイルに保存
 */
export const saveMultipleToFile = async (
  metadataList: Array<{ metadata: McpMetadata; platformName: string }>,
  filePath: string,
): Promise<void> => {
  const fs = await import("fs/promises");
  const markdown = formatMultipleToMarkdown(metadataList);
  await fs.writeFile(filePath, markdown, "utf-8");
  console.log(`Markdownファイルを保存しました: ${filePath}`);
};
