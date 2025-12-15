import { makeClaudeAiModelSetting } from "@aiModels/claude/adapter/claudeAiModelSetting";
import { loadClaudeConfig } from "@aiModels/claude/domain/settings/claudeConfig";
import { loadClaudeEnv } from "@aiModels/claude/infrastructure/env/claudeEnv";

// モジュールをモック化
jest.mock("@aiModels/claude/domain/settings/claudeConfig");
jest.mock("@aiModels/claude/infrastructure/env/claudeEnv");

describe("claudeAiModelSetting", () => {
  describe("makeClaudeAiModelSetting", () => {
    it("設定オブジェクトを正しく作成できること", () => {
      const setting = makeClaudeAiModelSetting();

      expect(setting).toBeDefined();
      expect(setting.getConfig).toBeDefined();
      expect(setting.getEnv).toBeDefined();
    });

    it("getConfigがloadClaudeConfigを呼び出すこと", async () => {
      const mockConfig = {
        baseUrl: "https://api.anthropic.com",
        defaultModel: "claude-3-5-sonnet-20241022",
        defaultMaxTokens: 4096,
        defaultVersion: "2023-06-01",
      };
      (loadClaudeConfig as jest.Mock).mockReturnValue(mockConfig);

      const setting = makeClaudeAiModelSetting();
      const config = await setting.getConfig();

      expect(loadClaudeConfig).toHaveBeenCalled();
      expect(config).toEqual(mockConfig);
    });

    it("getEnvがloadClaudeEnvを呼び出すこと", async () => {
      const mockEnv = {
        anthropicApiKey: "test-api-key",
      };
      (loadClaudeEnv as jest.Mock).mockReturnValue(mockEnv);

      const setting = makeClaudeAiModelSetting();
      const env = await setting.getEnv();

      expect(loadClaudeEnv).toHaveBeenCalled();
      expect(env).toEqual(mockEnv);
    });
  });
});
