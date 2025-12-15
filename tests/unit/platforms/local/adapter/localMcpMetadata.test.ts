import { makeLocalMcpMetadata } from "@platforms/local/adapter/localMcpMetadata";

describe("localMcpMetadata", () => {
  describe("makeLocalMcpMetadata", () => {
    it("メタデータオブジェクトを正しく作成できること", () => {
      const metadata = makeLocalMcpMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.getSummary).toBeDefined();
      expect(metadata.getUsageContext).toBeDefined();
      expect(metadata.getCommands).toBeDefined();
      expect(metadata.getSecurityRules).toBeDefined();
    });

    it("getSummaryが値を返すこと", () => {
      const metadata = makeLocalMcpMetadata();
      const summary = metadata.getSummary();

      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
      expect(summary[0]).toBe("ファイルシステムへのアクセス");
    });

    it("getUsageContextが値を返すこと", () => {
      const metadata = makeLocalMcpMetadata();
      const context = metadata.getUsageContext();

      expect(Array.isArray(context)).toBe(true);
      expect(context.length).toBeGreaterThan(0);
      expect(context).toContain("コードファイルを読み込む場合");
      expect(context).toContain("ディレクトリ構造を確認する場合");
      expect(context).toContain("ファイル名で検索する場合");
      expect(context).toContain("コード内の特定のパターンを検索する場合");
    });

    it("getCommandsが値を返すこと", () => {
      const metadata = makeLocalMcpMetadata();
      const commands = metadata.getCommands();

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBe(5);
      expect(commands[0]).toHaveProperty("description");
      expect(commands[0]).toHaveProperty("command");
      expect(commands[0]).toHaveProperty("usage");
    });

    it("readFileコマンドが正しく定義されていること", () => {
      const metadata = makeLocalMcpMetadata();
      const commands = metadata.getCommands();
      const readFileCommand = commands.find((cmd) =>
        cmd.command.startsWith("readFile"),
      );

      expect(readFileCommand).toBeDefined();
      expect(readFileCommand?.command).toBe("readFile <filePath>");
      expect(readFileCommand?.usage).toContain("local:readFile");
    });

    it("listFilesコマンドが正しく定義されていること", () => {
      const metadata = makeLocalMcpMetadata();
      const commands = metadata.getCommands();
      const listFilesCommand = commands.find((cmd) =>
        cmd.command.startsWith("listFiles"),
      );

      expect(listFilesCommand).toBeDefined();
      expect(listFilesCommand?.command).toBe("listFiles <dirPath> [recursive]");
      expect(listFilesCommand?.usage).toContain("local:listFiles");
    });

    it("searchFilesByNameコマンドが正しく定義されていること", () => {
      const metadata = makeLocalMcpMetadata();
      const commands = metadata.getCommands();
      const searchFilesByNameCommand = commands.find((cmd) =>
        cmd.command.startsWith("searchFilesByName"),
      );

      expect(searchFilesByNameCommand).toBeDefined();
      expect(searchFilesByNameCommand?.command).toBe(
        "searchFilesByName <pattern> [rootPath]",
      );
      expect(searchFilesByNameCommand?.usage).toContain(
        "local:searchFilesByName",
      );
    });

    it("searchCodeコマンドが正しく定義されていること", () => {
      const metadata = makeLocalMcpMetadata();
      const commands = metadata.getCommands();
      const searchCodeCommand = commands.find((cmd) =>
        cmd.command.startsWith("searchCode"),
      );

      expect(searchCodeCommand).toBeDefined();
      expect(searchCodeCommand?.command).toBe(
        "searchCode <pattern> [rootPath] [filePattern] [contextLines]",
      );
      expect(searchCodeCommand?.usage).toContain("local:searchCode");
    });

    it("findDirsByNameコマンドが正しく定義されていること", () => {
      const metadata = makeLocalMcpMetadata();
      const commands = metadata.getCommands();
      const findDirsByNameCommand = commands.find((cmd) =>
        cmd.command.startsWith("findDirsByName"),
      );

      expect(findDirsByNameCommand).toBeDefined();
      expect(findDirsByNameCommand?.command).toBe(
        "findDirsByName <names> [rootPath]",
      );
      expect(findDirsByNameCommand?.usage).toContain("local:findDirsByName");
      expect(findDirsByNameCommand?.description).toContain("再帰的に検索");
    });

    it("getSecurityRulesが値を返すこと", () => {
      const metadata = makeLocalMcpMetadata();
      const securityRules = metadata.getSecurityRules();

      expect(Array.isArray(securityRules)).toBe(true);
      expect(securityRules.length).toBeGreaterThan(0);
      expect(securityRules).toContain(
        "絶対禁止: ファイルの削除・変更・作成する行為",
      );
      expect(securityRules).toContain(
        "絶対禁止: 個人情報や機密情報を含むファイルを読み込む行為",
      );
      expect(securityRules).toContain(
        "絶対禁止: システムファイルや設定ファイルを読み込む行為",
      );
      expect(securityRules).toContain("読み取り専用の操作のみ許可");
    });
  });
});
