import { makeClaudeAiModelMetadata } from "@aiModels/claude/adapter/claudeAiModelMetadata";

describe("claudeAiModelMetadata", () => {
  describe("makeClaudeAiModelMetadata", () => {
    it("メタデータオブジェクトを正しく作成できること", () => {
      const metadata = makeClaudeAiModelMetadata();

      expect(metadata).toBeDefined();
      expect(metadata.getSummary).toBeDefined();
      expect(metadata.getUsageContext).toBeDefined();
      expect(metadata.getFunctions).toBeDefined();
      expect(metadata.getSecurityRules).toBeDefined();
    });

    it("getSummaryが値を返すこと", () => {
      const metadata = makeClaudeAiModelMetadata();
      const summary = metadata.getSummary();

      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
    });

    it("getUsageContextが値を返すこと", () => {
      const metadata = makeClaudeAiModelMetadata();
      const context = metadata.getUsageContext();

      expect(Array.isArray(context)).toBe(true);
      expect(context.length).toBeGreaterThan(0);
    });

    it("getFunctionsが値を返すこと", () => {
      const metadata = makeClaudeAiModelMetadata();
      const functions = metadata.getFunctions();

      expect(Array.isArray(functions)).toBe(true);
      expect(functions.length).toBeGreaterThan(0);
      expect(functions[0]).toHaveProperty("description");
      expect(functions[0]).toHaveProperty("functionName");
      expect(functions[0]).toHaveProperty("usage");
    });

    it("getSecurityRulesが値を返すこと", () => {
      const metadata = makeClaudeAiModelMetadata();
      const securityRules = metadata.getSecurityRules();

      expect(Array.isArray(securityRules)).toBe(true);
    });

    it("ask関数がFunctionsに含まれていること", () => {
      const metadata = makeClaudeAiModelMetadata();
      const functions = metadata.getFunctions();

      const askFunction = functions.find((f) => f.functionName === "ask");
      expect(askFunction).toBeDefined();
      expect(askFunction?.description).toContain("Claude");
    });
  });
});
