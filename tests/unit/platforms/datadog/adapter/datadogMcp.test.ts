import { makeDatadogMcp } from "@platforms/datadog/adapter/datadogMcp";
import { DatadogRepository } from "@platforms/datadog/domain/repositories/datadogRepository";

describe("datadogMcp", () => {
  describe("makeDatadogMcp", () => {
    it("MCPオブジェクトを正しく作成できること", () => {
      const mcp = makeDatadogMcp({});

      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpFunctions.searchLogs).toBeDefined();
      expect(mcp.mcpFunctions.searchLogsFromUrl).toBeDefined();
      expect(mcp.mcpFunctions.getTraceMetadataBySpanId).toBeDefined();
      expect(mcp.mcpFunctions.searchLogsByCompanyCode).toBeDefined();
      expect(mcp.mcpMetadata).toBeDefined();
      expect(mcp.mcpSetting).toBeDefined();
    });

    it("searchLogs関数が実行できること", async () => {
      const mockRepository: DatadogRepository = {
        searchLogs: jest.fn().mockResolvedValue({
          payload: { data: [], meta: {} },
          isSuccess: true,
        }),
        searchLogsFromUrl: jest.fn(),
        getTraceMetadataBySpanId: jest.fn(),
        searchLogsByCompanyCode: jest.fn(),
      };

      const mcp = makeDatadogMcp({
        datadogRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.searchLogs("service:test", 50);

      expect(mockRepository.searchLogs).toHaveBeenCalledWith(
        "service:test",
        50,
      );
      expect(result.isSuccess).toBe(true);
    });

    it("searchLogsFromUrl関数が実行できること", async () => {
      const mockRepository: DatadogRepository = {
        searchLogs: jest.fn(),
        searchLogsFromUrl: jest.fn().mockResolvedValue({
          payload: { data: [], meta: {} },
          isSuccess: true,
        }),
        getTraceMetadataBySpanId: jest.fn(),
        searchLogsByCompanyCode: jest.fn(),
      };

      const mcp = makeDatadogMcp({
        datadogRepositoryFactory: mockRepository,
      });

      const url =
        "https://app.datadoghq.com/logs/analytics?query=service%3Atest";
      const result = await mcp.mcpFunctions.searchLogsFromUrl(url);

      expect(mockRepository.searchLogsFromUrl).toHaveBeenCalledWith(url);
      expect(result.isSuccess).toBe(true);
    });

    it("getTraceMetadataBySpanId関数が実行できること", async () => {
      const mockRepository: DatadogRepository = {
        searchLogs: jest.fn(),
        searchLogsFromUrl: jest.fn(),
        getTraceMetadataBySpanId: jest.fn().mockResolvedValue({
          payload: { metadata: {} },
          isSuccess: true,
        }),
        searchLogsByCompanyCode: jest.fn(),
      };

      const mcp = makeDatadogMcp({
        datadogRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.getTraceMetadataBySpanId("123456");

      expect(mockRepository.getTraceMetadataBySpanId).toHaveBeenCalledWith(
        "123456",
      );
      expect(result.isSuccess).toBe(true);
    });

    it("searchLogsByCompanyCode関数が実行できること", async () => {
      const mockRepository: DatadogRepository = {
        searchLogs: jest.fn(),
        searchLogsFromUrl: jest.fn(),
        getTraceMetadataBySpanId: jest.fn(),
        searchLogsByCompanyCode: jest.fn().mockResolvedValue({
          payload: { data: [], meta: {} },
          isSuccess: true,
        }),
      };

      const mcp = makeDatadogMcp({
        datadogRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.searchLogsByCompanyCode(
        "TEST001",
        "2026-01-28 11:22:34",
        "2026-01-28 11:27:34",
        "main",
      );

      expect(mockRepository.searchLogsByCompanyCode).toHaveBeenCalledWith(
        "TEST001",
        "2026-01-28 11:22:34",
        "2026-01-28 11:27:34",
        "main",
      );
      expect(result.isSuccess).toBe(true);
    });
  });
});
