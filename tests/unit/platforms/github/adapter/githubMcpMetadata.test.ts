import { makeGithubMcpMetadata } from "@platforms/github/adapter/githubMcpMetadata";

describe("githubMcpMetadata", () => {
  describe("makeGithubMcpMetadata", () => {
    it("メタデータオブジェクトを正しく作成できること", () => {
      const metadata = makeGithubMcpMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.getSummary).toBeDefined();
      expect(metadata.getUsageContext).toBeDefined();
      expect(metadata.getCommands).toBeDefined();
      expect(metadata.getSecurityRules).toBeDefined();
    });

    it("getSummaryが値を返すこと", () => {
      const metadata = makeGithubMcpMetadata();
      const summary = metadata.getSummary();

      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
    });

    it("getUsageContextが値を返すこと", () => {
      const metadata = makeGithubMcpMetadata();
      const context = metadata.getUsageContext();

      expect(Array.isArray(context)).toBe(true);
      expect(context.length).toBeGreaterThan(0);
    });

    it("getCommandsが値を返すこと", () => {
      const metadata = makeGithubMcpMetadata();
      const commands = metadata.getCommands();

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
      expect(commands[0]).toHaveProperty("description");
      expect(commands[0]).toHaveProperty("command");
      expect(commands[0]).toHaveProperty("usage");
    });

    it("searchCodeコマンドが含まれていること", () => {
      const metadata = makeGithubMcpMetadata();
      const commands = metadata.getCommands();

      const searchCodeCommand = commands.find((cmd) =>
        cmd.command.includes("searchCode"),
      );

      expect(searchCodeCommand).toBeDefined();
      expect(searchCodeCommand?.description).toBe("コードを検索");
      expect(searchCodeCommand?.command).toBe(
        "searchCode <query> [perPage] [page]",
      );
      expect(searchCodeCommand?.usage).toContain("github:searchCode");
    });

    it("getSecurityRulesが値を返すこと", () => {
      const metadata = makeGithubMcpMetadata();
      const securityRules = metadata.getSecurityRules();

      expect(Array.isArray(securityRules)).toBe(true);
      expect(securityRules.length).toBeGreaterThan(0);
    });
  });
});
