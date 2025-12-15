import {
  aiModelRegistry,
  getAllAiModelNames,
  getAllAiModels,
  useAiModel,
} from "@core/aiModelRegistry";

describe("aiModelRegistry", () => {
  describe("useAiModel", () => {
    it("claudeモデルを取得できること", () => {
      const model = useAiModel("claude");

      expect(model).toBeDefined();
      expect(model.aiModelFunctions).toBeDefined();
      expect(model.aiModelMetadata).toBeDefined();
      expect(model.aiModelSetting).toBeDefined();
    });

    it("存在しないモデル名でエラーをスローすること", () => {
      expect(() => useAiModel("unknown" as any)).toThrow(
        "AI Model 'unknown' is not supported",
      );
    });

    it("取得したモデルにaskメソッドが存在すること", () => {
      const model = useAiModel("claude");

      expect(model.aiModelFunctions).toHaveProperty("ask");
      expect(typeof (model.aiModelFunctions as any).ask).toBe("function");
    });
  });

  describe("getAllAiModels", () => {
    it("すべてのAIモデルを取得できること", () => {
      const models = getAllAiModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it("取得したモデルが正しい構造を持つこと", () => {
      const models = getAllAiModels();

      models.forEach((model) => {
        expect(model.aiModelFunctions).toBeDefined();
        expect(model.aiModelMetadata).toBeDefined();
        expect(model.aiModelSetting).toBeDefined();
      });
    });
  });

  describe("getAllAiModelNames", () => {
    it("すべてのAIモデル名を取得できること", () => {
      const names = getAllAiModelNames();

      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it("claudeが含まれていること", () => {
      const names = getAllAiModelNames();

      expect(names).toContain("claude");
    });
  });

  describe("aiModelRegistry", () => {
    it("レジストリ関数を取得できること", () => {
      const registry = aiModelRegistry();

      expect(registry).toBeDefined();
      expect(registry.useAiModel).toBeDefined();
      expect(registry.getAllAiModels).toBeDefined();
      expect(registry.getAllAiModelNames).toBeDefined();
    });

    it("レジストリ経由でモデルを取得できること", () => {
      const registry = aiModelRegistry();
      const model = registry.useAiModel("claude");

      expect(model).toBeDefined();
      expect(model.aiModelFunctions).toBeDefined();
    });
  });
});
