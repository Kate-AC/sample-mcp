import { loadDatadogConfig } from "@platforms/datadog/domain/settings/datadogConfig";
import { loadDatadogEnv } from "@platforms/datadog/infrastructure/env/datadogEnv";
import { makeDatadogApiClient } from "@platforms/datadog/infrastructure/http/datadogApiClient";
import { makeApiClient } from "@infrastructure/shared/apiClient";

// モジュールをモック化
jest.mock("@infrastructure/shared/apiClient");
jest.mock("@platforms/datadog/domain/settings/datadogConfig");
jest.mock("@platforms/datadog/infrastructure/env/datadogEnv");

describe("datadogApiClient", () => {
  beforeEach(() => {
    (loadDatadogConfig as jest.Mock).mockReturnValue({
      baseUrl: "https://api.datadoghq.com",
    });
    (loadDatadogEnv as jest.Mock).mockReturnValue({
      apiKey: "test-api-key",
      applicationKey: "test-application-key",
    });
  });

  describe("makeDatadogApiClient", () => {
    it("ApiClientが返されること", async () => {
      const mockApiClient = {
        baseUrl: "https://api.datadoghq.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
      };

      (makeApiClient as jest.Mock).mockResolvedValue(mockApiClient);

      const apiClient = await makeDatadogApiClient();

      expect(makeApiClient).toHaveBeenCalledWith(
        "https://api.datadoghq.com",
        expect.objectContaining({
          "Content-Type": "application/json",
          "DD-API-KEY": "test-api-key",
          "DD-APPLICATION-KEY": "test-application-key",
        }),
      );
      expect(apiClient).toBe(mockApiClient);
    });
  });
});
