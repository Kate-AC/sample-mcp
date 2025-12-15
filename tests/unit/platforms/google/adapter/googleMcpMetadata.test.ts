import { makeGoogleMcpMetadata } from "@platforms/google/adapter/googleMcpMetadata";

describe("googleMcpMetadata", () => {
  describe("makeGoogleMcpMetadata", () => {
    it("メタデータオブジェクトを正しく作成できること", () => {
      const metadata = makeGoogleMcpMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.getSummary).toBeDefined();
      expect(metadata.getUsageContext).toBeDefined();
      expect(metadata.getCommands).toBeDefined();
      expect(metadata.getSecurityRules).toBeDefined();
    });

    it("getSummaryが値を返すこと", () => {
      const metadata = makeGoogleMcpMetadata();
      const summary = metadata.getSummary();

      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
    });

    it("getUsageContextが値を返すこと", () => {
      const metadata = makeGoogleMcpMetadata();
      const context = metadata.getUsageContext();

      expect(Array.isArray(context)).toBe(true);
      expect(context.length).toBeGreaterThan(0);
    });

    it("getCommandsが値を返すこと", () => {
      const metadata = makeGoogleMcpMetadata();
      const commands = metadata.getCommands();

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
      expect(commands[0]).toHaveProperty("description");
      expect(commands[0]).toHaveProperty("command");
      expect(commands[0]).toHaveProperty("usage");
    });

    it("getDocumentコマンドにタブ指定の説明が含まれていること", () => {
      const metadata = makeGoogleMcpMetadata();
      const commands = metadata.getCommands();
      const getDocumentCommand = commands.find((cmd) =>
        cmd.command.startsWith("getDocument"),
      );

      expect(getDocumentCommand).toBeDefined();
      expect(getDocumentCommand?.description).toContain("タブ");
      expect(getDocumentCommand?.command).toContain("[tabId]");
      expect(getDocumentCommand?.usage).toBeDefined();
    });

    it("getSecurityRulesが値を返すこと", () => {
      const metadata = makeGoogleMcpMetadata();
      const securityRules = metadata.getSecurityRules();

      expect(Array.isArray(securityRules)).toBe(true);
    });
  });
});
