import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { makeRedashRepository } from "@platforms/redash/infrastructure/repositories/redashRepository";

describe("redashRepository", () => {
  describe("executeSql", () => {
    it("即座に結果が返る場合、正しく結果を返すこと", async () => {
      // モックAPIクライアント（即座に結果が返るケース）
      const mockApiClient: ApiClientPort = {
        baseUrl: "https://redash.example.com",
        headers: {},
        get: jest.fn(),
        post: jest.fn().mockResolvedValue({
          data: {
            query_result: {
              id: 1,
              query_hash: "hash123",
              query: "SELECT 1",
              data: {
                columns: [
                  { name: "test", friendly_name: "test", type: "integer" },
                ],
                rows: [{ test: 1 }],
              },
              data_source_id: 2,
              runtime: 0.01,
              retrieved_at: "2025-01-01T00:00:00Z",
            },
          },
          status: 200,
          statusText: "OK",
          config: {} as any,
          headers: {},
        }),
        put: jest.fn(),
      };

      const repository = makeRedashRepository(() => mockApiClient);

      const result = await repository.executeSql("SELECT 1", 2);

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.columns).toHaveLength(1);
      expect(result.payload?.rows).toHaveLength(1);
      expect(result.payload?.rows[0]).toEqual({ test: 1 });
      expect(result.payload?.runtime).toBe(0.01);

      // POSTが正しいパラメータで呼ばれたか確認
      expect(mockApiClient.post).toHaveBeenCalledWith("/api/query_results", {
        query: "SELECT 1",
        data_source_id: 2,
      });
    });

    it("ジョブとして実行される場合、正しくポーリングして結果を返すこと", async () => {
      // ポーリング回数をカウント
      let pollCount = 0;

      // モックAPIクライアント（ジョブケース）
      const mockApiClient: ApiClientPort = {
        baseUrl: "https://redash.example.com",
        headers: {},
        get: jest.fn().mockImplementation((path: string) => {
          // ジョブステータス確認
          if (path.startsWith("/api/jobs/")) {
            pollCount++;
            // 2回目のポーリングで成功とする
            const status = pollCount >= 2 ? 3 : 1; // 1=PENDING, 3=SUCCESS
            return Promise.resolve({
              data: {
                job: {
                  id: "job123",
                  status,
                  query_result_id: status === 3 ? 999 : undefined,
                },
              },
              status: 200,
              statusText: "OK",
              config: {} as any,
              headers: {},
            });
          }

          // クエリ結果取得
          if (path.startsWith("/api/query_results/")) {
            return Promise.resolve({
              data: {
                query_result: {
                  id: 999,
                  query_hash: "hash456",
                  query: "SELECT * FROM table",
                  data: {
                    columns: [
                      { name: "id", friendly_name: "id", type: "integer" },
                      { name: "value", friendly_name: "value", type: "string" },
                    ],
                    rows: [
                      { id: 1, value: "test1" },
                      { id: 2, value: "test2" },
                    ],
                  },
                  data_source_id: 2,
                  runtime: 0.5,
                  retrieved_at: "2025-01-01T00:00:01Z",
                },
              },
              status: 200,
              statusText: "OK",
              config: {} as any,
              headers: {},
            });
          }

          return Promise.reject(new Error("Unknown path"));
        }),
        post: jest.fn().mockResolvedValue({
          data: {
            job: {
              id: "job123",
              status: 1, // PENDING
            },
          },
          status: 200,
          statusText: "OK",
          config: {} as any,
          headers: {},
        }),
        put: jest.fn(),
      };

      const repository = makeRedashRepository(() => mockApiClient);

      const result = await repository.executeSql("SELECT * FROM table", 2);

      expect(result.isSuccess).toBe(true);
      expect(result.payload?.columns).toHaveLength(2);
      expect(result.payload?.rows).toHaveLength(2);
      expect(result.payload?.rows[0]).toEqual({ id: 1, value: "test1" });
      expect(result.payload?.runtime).toBe(0.5);

      // ポーリングが実行されたか確認
      expect(pollCount).toBeGreaterThanOrEqual(2);
    });

    it("ジョブが失敗した場合、エラーを返すこと", async () => {
      const mockApiClient: ApiClientPort = {
        baseUrl: "https://redash.example.com",
        headers: {},
        get: jest.fn().mockResolvedValue({
          data: {
            job: {
              id: "job123",
              status: 4, // FAILURE
              error: "Syntax error in SQL",
            },
          },
          status: 200,
          statusText: "OK",
          config: {} as any,
          headers: {},
        }),
        post: jest.fn().mockResolvedValue({
          data: {
            job: {
              id: "job123",
              status: 1, // PENDING
            },
          },
          status: 200,
          statusText: "OK",
          config: {} as any,
          headers: {},
        }),
        put: jest.fn(),
      };

      const repository = makeRedashRepository(() => mockApiClient);

      const result = await repository.executeSql("INVALID SQL", 2);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Syntax error in SQL");
    });

    it("ジョブがタイムアウトした場合、エラーを返すこと", async () => {
      const mockApiClient: ApiClientPort = {
        baseUrl: "https://redash.example.com",
        headers: {},
        get: jest.fn().mockResolvedValue({
          data: {
            job: {
              id: "job123",
              status: 1, // 常にPENDING（タイムアウト）
            },
          },
          status: 200,
          statusText: "OK",
          config: {} as any,
          headers: {},
        }),
        post: jest.fn().mockResolvedValue({
          data: {
            job: {
              id: "job123",
              status: 1,
            },
          },
          status: 200,
          statusText: "OK",
          config: {} as any,
          headers: {},
        }),
        put: jest.fn(),
      };

      const repository = makeRedashRepository(() => mockApiClient);

      const result = await repository.executeSql("SELECT SLEEP(100)", 2);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("タイムアウト");
    }, 35000); // テストのタイムアウトを35秒に設定
  });
});
