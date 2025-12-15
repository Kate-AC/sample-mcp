import { loadGitHubConfig } from "@platforms/github/domain/settings/githubConfig";
import { loadGitHubEnv } from "@platforms/github/infrastructure/env/githubEnv";
import {
  makeGitHubApiClient,
  makeGitHubApiClientForGitDiff,
} from "@platforms/github/infrastructure/http/githubApiClient";
import { makeApiClient } from "@infrastructure/shared/apiClient";

// モジュールをモック化
jest.mock("@infrastructure/shared/apiClient");
jest.mock("@platforms/github/domain/settings/githubConfig");
jest.mock("@platforms/github/infrastructure/env/githubEnv");

describe("githubApiClient", () => {
  beforeEach(() => {
    (loadGitHubConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://api.github.com",
    });
    (loadGitHubEnv as jest.Mock).mockReturnValue({
      personalAccessToken: "test-token",
    });
  });

  describe("makeGitHubApiClient", () => {
    it("ApiClientが返されること", () => {
      const mockApiClient = {
        baseUrl: "https://api.github.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = makeGitHubApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://api.github.com",
        expect.objectContaining({
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitHub-Client/1.0",
          Authorization: "token test-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });

    it("カスタムヘッダーをマージできること", () => {
      const mockApiClient = {
        baseUrl: "https://api.github.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      makeGitHubApiClient({ "X-Custom-Header": "custom-value" });

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://api.github.com",
        expect.objectContaining({
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitHub-Client/1.0",
          Authorization: "token test-token",
          "X-Custom-Header": "custom-value",
        }),
      );
    });

    it("githubAppTokenが定義されている場合はそちらを使うこと", () => {
      (loadGitHubEnv as jest.Mock).mockReturnValue({
        personalAccessToken: "pat-token",
        githubAppToken: "apps-token",
      });

      makeGitHubApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://api.github.com",
        expect.objectContaining({
          Authorization: "token apps-token",
        }),
      );
    });

    it("githubAppTokenが未定義の場合はpersonalAccessTokenを使うこと", () => {
      (loadGitHubEnv as jest.Mock).mockReturnValue({
        personalAccessToken: "pat-token",
      });

      makeGitHubApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://api.github.com",
        expect.objectContaining({
          Authorization: "token pat-token",
        }),
      );
    });
  });

  describe("makeGitHubApiClientForGitDiff", () => {
    it("Diff用のApiClientが返されること", () => {
      const mockApiClient = {
        baseUrl: "https://api.github.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = makeGitHubApiClientForGitDiff();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://api.github.com",
        expect.objectContaining({
          Accept: "application/vnd.github.diff",
          "User-Agent": "GitHub-Client/1.0",
          Authorization: "token test-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });
});
