import { loadRedashConfig } from "@platforms/redash/domain/settings/redashConfig";
import { loadRedashEnv } from "@platforms/redash/infrastructure/env/redashEnv";
import { makeRedashApiClient } from "@platforms/redash/infrastructure/http/redashApiClient";
import { makeApiClient } from "@infrastructure/shared/apiClient";

// モジュールをモック化
jest.mock("@infrastructure/shared/apiClient");
jest.mock("@platforms/redash/domain/settings/redashConfig");
jest.mock("@platforms/redash/infrastructure/env/redashEnv");

describe("redashApiClient", () => {
  beforeEach(() => {
    (loadRedashConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://redash.example.com",
    });
    (loadRedashEnv as jest.Mock).mockReturnValue({
      apiKey: "test-api-key",
    });
  });

  describe("makeRedashApiClient", () => {
    it("ApiClientが返されること", () => {
      const mockApiClient = {
        baseUrl: "https://redash.example.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = makeRedashApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://redash.example.com",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Key test-api-key",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });
});
