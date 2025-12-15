import { loadClaudeConfig } from "@aiModels/claude/domain/settings/claudeConfig";

describe("claudeConfig", () => {
  describe("loadClaudeConfig", () => {
    it("正しい設定オブジェクトを返すこと", () => {
      const config = loadClaudeConfig();

      expect(config).toBeDefined();
      expect(config.defaultModel).toBeDefined();
      expect(config.defaultMaxTokens).toBeDefined();
      expect(config.defaultVersion).toBeDefined();
    });

    it("defaultModelがBedrockのモデルIDであること", () => {
      const config = loadClaudeConfig();

      expect(config.defaultModel).toBeDefined();
      expect(config.defaultModel).toContain("anthropic.claude");
    });

    it("defaultMaxTokensが正の数であること", () => {
      const config = loadClaudeConfig();

      expect(config.defaultMaxTokens).toBeGreaterThan(0);
      expect(typeof config.defaultMaxTokens).toBe("number");
    });

    it("defaultVersionが正しく設定されていること", () => {
      const config = loadClaudeConfig();

      expect(config.defaultVersion).toBeDefined();
      expect(typeof config.defaultVersion).toBe("string");
    });
  });
});
