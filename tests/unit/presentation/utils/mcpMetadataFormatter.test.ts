import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";
import {
  formatMultipleToMarkdown,
  formatToMarkdown,
  printMultipleToConsole,
  printToConsole,
  saveMultipleToFile,
  saveToFile,
} from "@presentation/utils/mcpMetadataFormatter";

describe("mcpMetadataFormatter", () => {
  const mockMetadata: McpMetadata = {
    getSummary: () => ["テストプラットフォームの概要"],
    getUsageContext: () => ["使用場面1", "使用場面2"],
    getCommands: () => [
      {
        description: "テストコマンド",
        command: "test <arg>",
        usage: 'test "example"',
      },
    ],
    getSecurityRules: () => ["delete", "drop"],
  };

  describe("formatToMarkdown", () => {
    it("Markdown形式に正しくフォーマットできること", () => {
      const result = formatToMarkdown(mockMetadata, "TestPlatform");

      expect(result).toContain("# TestPlatform MCP");
      expect(result).toContain("## 概要");
      expect(result).toContain("テストプラットフォームの概要");
      expect(result).toContain("## 使用場面");
      expect(result).toContain("- 使用場面1");
      expect(result).toContain("- 使用場面2");
      expect(result).toContain("## 利用可能なコマンド");
      expect(result).toContain("### test <arg>");
      expect(result).toContain("**説明:** テストコマンド");
      expect(result).toContain("## セキュリティルール");
      expect(result).toContain("- delete");
      expect(result).toContain("- drop");
    });

    it("空の情報でも正しくフォーマットできること", () => {
      const emptyMetadata: McpMetadata = {
        getSummary: () => [],
        getUsageContext: () => [],
        getCommands: () => [],
        getSecurityRules: () => [],
      };

      const result = formatToMarkdown(emptyMetadata, "Empty");

      expect(result).toContain("# Empty MCP");
      expect(result).toContain("*概要情報なし*");
      expect(result).toContain("*使用場面情報なし*");
      expect(result).toContain("*利用可能なコマンドなし*");
      expect(result).not.toContain("## セキュリティルール");
    });
  });

  describe("formatMultipleToMarkdown", () => {
    it("複数のプラットフォームをMarkdown形式でフォーマットできること", () => {
      const metadataList = [
        { metadata: mockMetadata, platformName: "Platform1" },
        { metadata: mockMetadata, platformName: "Platform2" },
      ];

      const result = formatMultipleToMarkdown(metadataList);

      expect(result).toContain("# プラットフォーム MCP 一覧");
      expect(result).toContain("利用可能なプラットフォーム数: 2");
      expect(result).toContain("## 目次");
      expect(result).toContain("- [Platform1](#platform1-mcp)");
      expect(result).toContain("- [Platform2](#platform2-mcp)");
      expect(result).toContain("# Platform1 MCP");
      expect(result).toContain("# Platform2 MCP");
    });
  });

  describe("printToConsole", () => {
    it("コンソールに出力できること", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      printToConsole(mockMetadata, "TestPlatform");

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("# TestPlatform MCP");

      consoleSpy.mockRestore();
    });
  });

  describe("printMultipleToConsole", () => {
    it("複数のメタデータをコンソールに出力できること", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const metadataList = [
        { metadata: mockMetadata, platformName: "Platform1" },
      ];

      printMultipleToConsole(metadataList);

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain("# プラットフォーム MCP 一覧");

      consoleSpy.mockRestore();
    });
  });

  describe("saveToFile", () => {
    it("ファイルに保存できること", async () => {
      const mockWriteFile = jest.fn().mockResolvedValue(undefined);
      jest.mock("fs/promises", () => ({
        writeFile: mockWriteFile,
      }));

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await saveToFile(mockMetadata, "TestPlatform", "/tmp/test.md");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Markdownファイルを保存しました: /tmp/test.md",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("saveMultipleToFile", () => {
    it("複数のメタデータをファイルに保存できること", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const metadataList = [
        { metadata: mockMetadata, platformName: "Platform1" },
      ];

      await saveMultipleToFile(metadataList, "/tmp/test-multiple.md");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Markdownファイルを保存しました: /tmp/test-multiple.md",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("formatToPlainText", () => {
    it("プレーンテキスト形式に正しくフォーマットできること", () => {
      const {
        formatToPlainText,
      } = require("@presentation/utils/mcpMetadataFormatter");
      const result = formatToPlainText(mockMetadata, "TestPlatform");

      expect(result).toContain("# TESTPLATFORM Platform");
      expect(result).toContain("## 概要");
      expect(result).toContain("テストプラットフォームの概要");
      expect(result).toContain("## 使用場面");
      expect(result).toContain("- 使用場面1");
      expect(result).toContain("- 使用場面2");
      expect(result).toContain("## 利用可能なコマンド");
      expect(result).toContain("1. test <arg>");
      expect(result).toContain("説明: テストコマンド");
      expect(result).toContain("使用方法:");
      expect(result).toContain('test "example"');
      expect(result).toContain("## セキュリティルール");
      expect(result).toContain("- delete");
      expect(result).toContain("- drop");

      // Markdown記法が含まれていないことを確認
      expect(result).not.toContain("**");
      expect(result).not.toContain("```");
    });

    it("空の情報でも正しくフォーマットできること", () => {
      const {
        formatToPlainText,
      } = require("@presentation/utils/mcpMetadataFormatter");
      const emptyMetadata: McpMetadata = {
        getSummary: () => [],
        getUsageContext: () => [],
        getCommands: () => [],
        getSecurityRules: () => [],
      };

      const result = formatToPlainText(emptyMetadata, "Empty");

      expect(result).toContain("# EMPTY Platform");
      expect(result).toContain("概要情報なし");
      expect(result).toContain("使用場面情報なし");
      expect(result).toContain("利用可能なコマンドなし");
      expect(result).not.toContain("## セキュリティルール");
    });
  });
});
