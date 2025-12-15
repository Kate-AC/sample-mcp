import {
  PlatformName,
  getAllMcp,
  getAllMcpNames,
  getMcp,
} from "@core/mcpRegistry";

/**
 * mcpRegistry のテスト
 *
 * 注意: このテストは各プラットフォームのMCPに依存しているため、
 * 結合テスト的な性質を持ちます。
 */

describe("mcpRegistry", () => {
  describe("getMcp", () => {
    it("slack platformのMCPを取得できる", () => {
      const mcp = getMcp("slack");
      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpMetadata).toBeDefined();
      expect(mcp.mcpSetting).toBeDefined();
    });

    it("redmine platformのMCPを取得できる", () => {
      const mcp = getMcp("redmine");
      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpMetadata).toBeDefined();
      expect(mcp.mcpSetting).toBeDefined();
    });

    it("サポートされていないプラットフォームの場合、エラーをthrowする", () => {
      expect(() => {
        getMcp("invalid" as PlatformName);
      }).toThrow("Platform 'invalid' is not supported");
    });
  });

  describe("getAllMcp", () => {
    it("すべてのプラットフォームのMCPを配列で取得できる", () => {
      const mcps = getAllMcp();
      expect(Array.isArray(mcps)).toBe(true);
      expect(mcps.length).toBe(2); // slack, redmine
    });

    it("取得したすべてのMCPが正しい構造を持つ", () => {
      const mcps = getAllMcp();
      mcps.forEach((mcp) => {
        expect(mcp).toBeDefined();
        expect(mcp.mcpFunctions).toBeDefined();
        expect(mcp.mcpMetadata).toBeDefined();
        expect(mcp.mcpSetting).toBeDefined();
      });
    });

    it("各プラットフォームのメタデータが取得できる", () => {
      const mcps = getAllMcp();
      mcps.forEach((mcp) => {
        const metadata = mcp.mcpMetadata;
        expect(metadata.getSummary).toBeDefined();
        expect(metadata.getUsageContext).toBeDefined();
        expect(metadata.getCommands).toBeDefined();
        expect(metadata.getSecurityRules).toBeDefined();
      });
    });
  });

  describe("getAllMcpNames", () => {
    it("すべてのプラットフォーム名を配列で取得できる", () => {
      const names = getAllMcpNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBe(2);
    });

    it("取得したプラットフォーム名が期待通りである", () => {
      const names = getAllMcpNames();
      const expectedNames = ["slack", "redmine"];
      expect(names).toEqual(expectedNames);
    });

    it("各プラットフォーム名がPlatformName型である", () => {
      const names = getAllMcpNames();
      names.forEach((name) => {
        // PlatformName型として使えることを確認
        const mcp = getMcp(name);
        expect(mcp).toBeDefined();
      });
    });
  });
});
