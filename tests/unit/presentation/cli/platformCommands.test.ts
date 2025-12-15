import {
  findCommand,
  platformCommands,
  showAllPlatformCommands,
  showHelp,
  showPlatformHelp,
} from "@presentation/cli/platformCommands";

describe("platformCommands", () => {
  describe("platformCommands", () => {
    it("コマンドの配列が定義されていること", () => {
      expect(Array.isArray(platformCommands)).toBe(true);
    });

    it("各MCPのメタデータからコマンドが動的に生成されていること", () => {
      expect(platformCommands.length).toBeGreaterThan(0);

      // 各コマンドが正しい構造を持つことを確認
      platformCommands.forEach((cmd) => {
        expect(cmd.name).toBeDefined();
        expect(cmd.description).toBeDefined();
        expect(cmd.execute).toBeDefined();
        expect(typeof cmd.execute).toBe("function");

        // コマンド名がplatform:command形式であることを確認
        expect(cmd.name).toMatch(/^[a-z]+:.+$/);
      });
    });

    it("GitHubプラットフォームのコマンドが含まれていること", () => {
      const githubCommands = platformCommands.filter((cmd) =>
        cmd.name.startsWith("github:"),
      );
      expect(githubCommands.length).toBeGreaterThan(0);
    });
  });

  describe("findCommand", () => {
    it("コマンドが見つからない場合、undefinedを返すこと", () => {
      const result = findCommand("non-existent-command");
      expect(result).toBeUndefined();
    });

    it("動的に生成されたコマンドを検索できること", () => {
      // 動的生成されたGitHubコマンドを検索
      const githubCommand = platformCommands.find((cmd) =>
        cmd.name.startsWith("github:"),
      );

      if (githubCommand) {
        const result = findCommand(githubCommand.name);
        expect(result).toBe(githubCommand);
      }
    });
  });

  describe("showHelp", () => {
    it("ヘルプメッセージを表示できること", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      showHelp();

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map((call) => call[0]).join("\n");
      expect(output).toContain("使用方法");
      expect(output).toContain("all-commands");
      expect(output).toContain("show-markdown");
      expect(output).toContain("help");

      consoleSpy.mockRestore();
    });
  });

  describe("showPlatformHelp", () => {
    it("指定したプラットフォームのコマンド一覧を表示できること", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      showPlatformHelp("github");

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map((call) => call[0]).join("\n");
      expect(output).toContain("GITHUB Platform");

      consoleSpy.mockRestore();
    });

    it("存在しないプラットフォームの場合、エラーメッセージを表示すること", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      showPlatformHelp("nonexistent");

      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls
        .map((call) => call[0])
        .join("\n");
      expect(output).toContain("が見つかりません");

      consoleErrorSpy.mockRestore();
    });
  });

  describe("showAllPlatformCommands", () => {
    it("全プラットフォームのコマンド一覧を表示できること", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      showAllPlatformCommands();

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map((call) => call[0]).join("\n");
      expect(output).toContain("全プラットフォームのコマンド一覧");
      expect(output).toContain("GITHUB Platform");
      expect(output).toContain("GOOGLE Platform");

      consoleSpy.mockRestore();
    });
  });
});
