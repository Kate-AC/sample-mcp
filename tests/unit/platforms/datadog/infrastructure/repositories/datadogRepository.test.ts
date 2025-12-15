import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import {
  DatadogLogSearchPayload,
  DatadogTracePayload,
} from "@platforms/datadog/domain/repositories/datadogRepositoryPayload";
import { makeDatadogRepository } from "@platforms/datadog/infrastructure/repositories/datadogRepository";

describe("datadogRepository", () => {
  describe("makeDatadogRepository", () => {
    describe("searchLogs", () => {
      it("ログ検索が正常に実行できること", async () => {
        const mockResponse: DatadogLogSearchPayload = {
          data: [
            {
              id: "log-1",
              attributes: {
                timestamp: "2026-01-28T11:22:34Z",
                message: "test log message",
              },
            },
          ],
          meta: {},
        };

        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn(),
          post: jest.fn().mockResolvedValue({
            data: mockResponse,
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        const result = await repository.searchLogs("service:test", 50);

        expect(mockApiClient.post).toHaveBeenCalledWith("/logs/events/search", {
          filter: {
            query: "service:test",
            indexes: [],
          },
          page: {
            limit: 50,
          },
        });
        expect(result.isSuccess).toBe(true);
        if (result.payload) {
          expect(result.payload.data).toHaveLength(1);
          expect(result.payload.data[0]?.id).toBe("log-1");
        }
      });

      it("デフォルトのlimitが100であること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn(),
          post: jest.fn().mockResolvedValue({
            data: { data: [], meta: {} },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        await repository.searchLogs("service:test");

        expect(mockApiClient.post).toHaveBeenCalledWith("/logs/events/search", {
          filter: {
            query: "service:test",
            indexes: [],
          },
          page: {
            limit: 100,
          },
        });
      });

      it("APIエラーが適切に処理されること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn(),
          post: jest.fn().mockRejectedValue(new Error("API Error")),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        const result = await repository.searchLogs("service:test");

        expect(result.isSuccess).toBe(false);
        expect(result.message).toBeDefined();
      });
    });

    describe("searchLogsFromUrl", () => {
      it("URLからqueryパラメータを抽出して検索できること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn(),
          post: jest.fn().mockResolvedValue({
            data: { data: [], meta: {} },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        const url =
          "https://app.datadoghq.com/logs/analytics?query=service%3Atest&from_ts=1234567890&to_ts=1234567990";
        await repository.searchLogsFromUrl(url);

        expect(mockApiClient.post).toHaveBeenCalledWith("/logs/events/search", {
          filter: {
            query: "service:test",
            indexes: [],
            from: new Date(1234567890).toISOString(),
            to: new Date(1234567990).toISOString(),
          },
          page: {
            limit: 100,
          },
        });
      });

      it("queryパラメータがない場合は空文字列で検索すること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn(),
          post: jest.fn().mockResolvedValue({
            data: { data: [], meta: {} },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        const url = "https://app.datadoghq.com/logs/analytics";
        await repository.searchLogsFromUrl(url);

        expect(mockApiClient.post).toHaveBeenCalledWith("/logs/events/search", {
          filter: {
            query: "",
            indexes: [],
          },
          page: {
            limit: 100,
          },
        });
      });
    });

    describe("getTraceMetadataBySpanId", () => {
      it("トレースメタデータが正常に取得できること", async () => {
        const mockTraceResponse: DatadogTracePayload = {
          data: {
            attributes: {
              spans: [
                {
                  spanID: 123456,
                  traceID: 789012,
                  service: "test-service",
                  name: "test-operation",
                  resource: "test-resource",
                  startTime: 1000000,
                  endTime: 2000000,
                  duration: 1000000,
                  meta: {
                    env: "production",
                    version: "1.0.0",
                    "job.company_code": "TEST001",
                  },
                },
              ],
            },
            id: "789012",
            type: "trace",
          },
        };

        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn().mockResolvedValue({
            data: mockTraceResponse,
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        const result = await repository.getTraceMetadataBySpanId("123456");

        expect(mockApiClient.get).toHaveBeenCalledWith("/trace/123456");
        expect(result.isSuccess).toBe(true);
        if (result.payload) {
          expect(result.payload.metadata.duration).toBe(1000000);
          expect(result.payload.metadata.env).toBe("production");
          expect(result.payload.metadata.version).toBe("1.0.0");
        }
      });

      it("トレースが見つからない場合は空のメタデータを返すこと", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn().mockResolvedValue({
            data: null,
            status: 404,
            statusText: "Not Found",
            headers: {},
            config: {} as any,
          }),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        const result = await repository.getTraceMetadataBySpanId("999999");

        expect(result.isSuccess).toBe(false);
        if (result.payload) {
          expect(result.payload.metadata).toEqual({});
        }
      });

      it("APIエラーが適切に処理されること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn().mockRejectedValue(new Error("API Error")),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        const result = await repository.getTraceMetadataBySpanId("123456");

        expect(result.isSuccess).toBe(false);
        expect(result.message).toBeDefined();
      });
    });

    describe("searchLogsByCompanyCode", () => {
      it("company_codeでログ検索が正常に実行できること", async () => {
        const mockResponse: DatadogLogSearchPayload = {
          data: [
            {
              id: "log-1",
              attributes: {
                timestamp: "2026-01-28T11:22:34Z",
                message: "test log message",
              },
            },
          ],
          meta: {},
        };

        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn(),
          post: jest.fn().mockResolvedValue({
            data: mockResponse,
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        const result = await repository.searchLogsByCompanyCode(
          "TEST001",
          "2026-01-28 11:22:34",
          "2026-01-28 11:27:34",
        );

        expect(mockApiClient.post).toHaveBeenCalledWith(
          "/logs/events/search",
          expect.objectContaining({
            filter: expect.objectContaining({
              query: '"TEST001"',
              indexes: [],
            }),
            page: {
              limit: 1000,
            },
          }),
        );
        expect(result.isSuccess).toBe(true);
      });

      it("indexが指定された場合はindexesに含まれること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn(),
          post: jest.fn().mockResolvedValue({
            data: { data: [], meta: {} },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          }),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        await repository.searchLogsByCompanyCode(
          "TEST001",
          "2026-01-28 11:22:34",
          "2026-01-28 11:27:34",
          "main",
        );

        expect(mockApiClient.post).toHaveBeenCalledWith(
          "/logs/events/search",
          expect.objectContaining({
            filter: expect.objectContaining({
              query: '"TEST001"',
              indexes: ["main"],
            }),
          }),
        );
      });

      it("無効な日時形式の場合はエラーをスローすること", async () => {
        const mockApiClient: ApiClientPort = {
          baseUrl: "https://api.datadoghq.com",
          headers: {},
          get: jest.fn(),
          post: jest.fn(),
          put: jest.fn(),
        };

        const repository = makeDatadogRepository(async () => mockApiClient);

        await expect(
          repository.searchLogsByCompanyCode(
            "TEST001",
            "invalid-date",
            "2026-01-28 11:27:34",
          ),
        ).rejects.toThrow("Invalid JST datetime format");
      });
    });
  });
});
