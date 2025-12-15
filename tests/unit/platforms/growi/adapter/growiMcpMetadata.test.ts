import { makeGrowiMcpMetadata } from "@platforms/growi/adapter/growiMcpMetadata";

describe("growiMcpMetadata", () => {
  describe("makeGrowiMcpMetadata", () => {
    it("メタデータオブジェクトを正しく作成できること", () => {
      const metadata = makeGrowiMcpMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.getSummary).toBeDefined();
      expect(metadata.getUsageContext).toBeDefined();
      expect(metadata.getCommands).toBeDefined();
      expect(metadata.getSecurityRules).toBeDefined();
    });

    it("getSummaryが値を返すこと", () => {
      const metadata = makeGrowiMcpMetadata();
      const summary = metadata.getSummary();

      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
    });

    it("getUsageContextが値を返すこと", () => {
      const metadata = makeGrowiMcpMetadata();
      const context = metadata.getUsageContext();

      expect(Array.isArray(context)).toBe(true);
    });

    it("getCommandsが値を返すこと", () => {
      const metadata = makeGrowiMcpMetadata();
      const commands = metadata.getCommands();

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
      expect(commands[0]).toHaveProperty("description");
      expect(commands[0]).toHaveProperty("command");
      expect(commands[0]).toHaveProperty("usage");
    });

    it("getSecurityRulesが値を返すこと", () => {
      const metadata = makeGrowiMcpMetadata();
      const securityRules = metadata.getSecurityRules();

      expect(Array.isArray(securityRules)).toBe(true);
      expect(securityRules.length).toBeGreaterThan(0);
    });
  });
});
