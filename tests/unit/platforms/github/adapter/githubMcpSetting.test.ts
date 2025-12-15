import { makeGithubMcpSetting } from "@platforms/github/adapter/githubMcpSetting";
import { loadGitHubConfig } from "@platforms/github/domain/settings/githubConfig";
import { loadGitHubEnv } from "@platforms/github/infrastructure/env/githubEnv";

// モジュールをモック化
jest.mock("@platforms/github/domain/settings/githubConfig");
jest.mock("@platforms/github/infrastructure/env/githubEnv");

describe("githubMcpSetting", () => {
  describe("makeGithubMcpSetting", () => {
    it("設定オブジェクトを正しく作成できること", () => {
      const setting = makeGithubMcpSetting();

      expect(setting).toBeDefined();
      expect(setting.getConfig).toBeDefined();
      expect(setting.getEnv).toBeDefined();
    });

    it("getConfigがloadGitHubConfigを呼び出すこと", async () => {
      const mockConfig = {
        baseUrl: "https://api.github.com",
      };
      (loadGitHubConfig as jest.Mock).mockReturnValue(mockConfig);

      const setting = makeGithubMcpSetting();
      const config = await setting.getConfig();

      expect(loadGitHubConfig).toHaveBeenCalled();
      expect(config).toEqual(mockConfig);
    });

    it("getEnvがloadGitHubEnvを呼び出すこと", async () => {
      const mockEnv = {
        personalAccessToken: "test-token",
      };
      (loadGitHubEnv as jest.Mock).mockReturnValue(mockEnv);

      const setting = makeGithubMcpSetting();
      const env = await setting.getEnv();

      expect(loadGitHubEnv).toHaveBeenCalled();
      expect(env).toEqual(mockEnv);
    });
  });
});
