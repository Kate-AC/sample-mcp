import { loadGrowiConfig } from "@platforms/growi/domain/settings/growiConfig";
import { loadGrowiEnv } from "@platforms/growi/infrastructure/env/growiEnv";
import { makeGrowiApiClient } from "@platforms/growi/infrastructure/http/growiApiClient";
import { makeApiClient } from "@infrastructure/shared/apiClient";

// モジュールをモック化
jest.mock("@infrastructure/shared/apiClient");
jest.mock("@platforms/growi/domain/settings/growiConfig");
jest.mock("@platforms/growi/infrastructure/env/growiEnv");

describe("growiApiClient", () => {
  beforeEach(() => {
    (loadGrowiConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://growi.example.com",
    });
    (loadGrowiEnv as jest.Mock).mockReturnValue({
      apiToken: "test-api-token",
      cookie: "connect.sid=test-cookie",
    });
  });

  describe("makeGrowiApiClient", () => {
    it("ApiClientが返されること", () => {
      const mockApiClient = {
        baseUrl: "https://growi.example.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockReturnValue(mockApiClient);

      const apiClient = makeGrowiApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://growi.example.com",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-token",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });
});
