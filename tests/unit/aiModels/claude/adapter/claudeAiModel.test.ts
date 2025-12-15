import { makeClaudeAiModel } from "@aiModels/claude/adapter/claudeAiModel";

describe("claudeAiModel", () => {
  describe("makeClaudeAiModel", () => {
    it("AIモデルオブジェクトを正しく作成できること", () => {
      const aiModel = makeClaudeAiModel();

      expect(aiModel).toBeDefined();
      expect(aiModel.aiModelFunctions).toBeDefined();
      expect(aiModel.aiModelMetadata).toBeDefined();
      expect(aiModel.aiModelSetting).toBeDefined();
    });

    it("aiModelFunctionsにaskメソッドが存在すること", () => {
      const aiModel = makeClaudeAiModel();

      expect(aiModel.aiModelFunctions.ask).toBeDefined();
      expect(typeof aiModel.aiModelFunctions.ask).toBe("function");
    });

    it("aiModelMetadataが正しいメソッドを持つこと", () => {
      const aiModel = makeClaudeAiModel();

      expect(aiModel.aiModelMetadata.getSummary).toBeDefined();
      expect(aiModel.aiModelMetadata.getUsageContext).toBeDefined();
      expect(aiModel.aiModelMetadata.getFunctions).toBeDefined();
      expect(aiModel.aiModelMetadata.getSecurityRules).toBeDefined();
    });

    it("aiModelSettingが正しいメソッドを持つこと", () => {
      const aiModel = makeClaudeAiModel();

      expect(aiModel.aiModelSetting.getConfig).toBeDefined();
      expect(aiModel.aiModelSetting.getEnv).toBeDefined();
    });
  });
});
