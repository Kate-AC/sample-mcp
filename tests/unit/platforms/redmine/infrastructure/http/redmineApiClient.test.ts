import { loadRedmineConfig } from "@platforms/redmine/domain/settings/redmineConfig";
import { loadRedmineEnv } from "@platforms/redmine/infrastructure/env/redmineEnv";
import { makeRedmineApiClient } from "@platforms/redmine/infrastructure/http/redmineApiClient";
import { makeApiClient } from "@infrastructure/shared/apiClient";

// モジュールをモック化
jest.mock("@infrastructure/shared/apiClient");
jest.mock("@platforms/redmine/domain/settings/redmineConfig");
jest.mock("@platforms/redmine/infrastructure/env/redmineEnv");

describe("redmineApiClient", () => {
  beforeEach(() => {
    (loadRedmineConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://redmine.example.com",
    });
    (loadRedmineEnv as jest.Mock).mockReturnValue({
      apiKey: "test-api-key",
    });
  });

  describe("makeRedmineApiClient", () => {
    it("ApiClientが返されること", () => {
      const mockApiClient = {
        baseUrl: "https://redmine.example.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = makeRedmineApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://redmine.example.com",
        expect.objectContaining({
          "Content-Type": "application/json",
          "X-Redmine-API-Key": "test-api-key",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });
});
