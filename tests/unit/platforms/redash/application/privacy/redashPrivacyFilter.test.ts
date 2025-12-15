import { Result } from "@core/result/result";
import { makeRedashPrivacyFilterList } from "@platforms/redash/application/privacy/redashPrivacyFilter";
import {
  RedashExecuteSqlPayload,
  RedashQueryPayload,
} from "@platforms/redash/domain/repositories/redashRepositoryPayload";

describe("redashPrivacyFilter", () => {
  describe("makeRedashPrivacyFilterList", () => {
    it("maskPii=trueの場合、queryフィルターが個人情報をマスキングすること", () => {
      const filterList = makeRedashPrivacyFilterList(true);

      const mockQueryResult: Result<RedashQueryPayload> = {
        payload: {
          id: 123,
          name: "Test Query",
          description: "Test description",
          query: "SELECT * FROM table",
          query_hash: "abc123",
          version: 1,
          user: {
            id: 10,
            name: "Test User",
            email: "testuser@example.com",
          },
          is_archived: false,
          is_draft: false,
          schedule: null,
          options: { parameters: [] },
          data_source_id: 1,
          latest_query_data_id: null,
          tags: [],
          is_favorite: false,
          is_trashed: false,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
          retrieved_at: null,
        },
        status: 200,
        isSuccess: true,
        message: "OK",
      };

      const filtered = filterList.query(mockQueryResult);

      expect(filtered.payload.user.name).toBe("T********");
      expect(filtered.payload.user.email).toBe("t***@example.com");
    });

    it("maskPii=falseの場合、フィルターが何もマスキングしないこと", () => {
      const filterList = makeRedashPrivacyFilterList(false);

      const mockQueryResult: Result<RedashQueryPayload> = {
        payload: {
          id: 123,
          name: "Test Query",
          description: "Test description",
          query: "SELECT * FROM table",
          query_hash: "abc123",
          version: 1,
          user: {
            id: 10,
            name: "Test User",
            email: "testuser@example.com",
          },
          is_archived: false,
          is_draft: false,
          schedule: null,
          options: { parameters: [] },
          data_source_id: 1,
          latest_query_data_id: null,
          tags: [],
          is_favorite: false,
          is_trashed: false,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
          retrieved_at: null,
        },
        status: 200,
        isSuccess: true,
        message: "OK",
      };

      const filtered = filterList.query(mockQueryResult);

      expect(filtered.payload.user.name).toBe("Test User");
      expect(filtered.payload.user.email).toBe("testuser@example.com");
    });

    it("maskPii=trueの場合、executeSqlフィルターがPIIカラムをマスキングすること", () => {
      const filterList = makeRedashPrivacyFilterList(true);

      const mockSqlResult: Result<RedashExecuteSqlPayload> = {
        payload: {
          columns: [
            { name: "id", friendly_name: "id", type: "integer" },
            { name: "code", friendly_name: "code", type: "string" },
            { name: "name", friendly_name: "name", type: "string" },
            { name: "email", friendly_name: "email", type: "string" },
            { name: "tel", friendly_name: "tel", type: "string" },
            { name: "zip", friendly_name: "zip", type: "string" },
            { name: "addr1", friendly_name: "addr1", type: "string" },
          ],
          rows: [
            {
              id: 1,
              code: "TEST001",
              name: "Test Company",
              email: "test@example.com",
              tel: "03-1234-5678",
              zip: "123-4567",
              addr1: "東京都渋谷区",
            },
          ],
          runtime: 0.1,
          retrieved_at: "2025-01-01T00:00:00Z",
        },
        status: 200,
        isSuccess: true,
        message: "OK",
      };

      const filtered = filterList.executeSql(mockSqlResult);

      // PIIカラムがマスキングされていること
      expect(filtered.payload.rows[0]!["id"]).toBe(1); // マスク対象外
      expect(filtered.payload.rows[0]!["code"]).toBe("TEST001"); // マスク対象外
      expect(filtered.payload.rows[0]!["name"]).toBe("Test Company"); // name: マスク対象外
      expect(filtered.payload.rows[0]!["email"]).toBe("t***@example.com"); // email: マスク
      expect(filtered.payload.rows[0]!["tel"]).toBe("******5678"); // tel: マスク（最後4桁のみ）
      expect(filtered.payload.rows[0]!["zip"]).toBe("1*******"); // zip: マスク
      expect(filtered.payload.rows[0]!["addr1"]).toBe("東*****"); // addr1: マスク
    });

    it("maskPii=trueの場合、executeSqlフィルターが複数行をマスキングすること", () => {
      const filterList = makeRedashPrivacyFilterList(true);

      const mockSqlResult: Result<RedashExecuteSqlPayload> = {
        payload: {
          columns: [
            { name: "id", friendly_name: "id", type: "integer" },
            { name: "name", friendly_name: "name", type: "string" },
            { name: "tel", friendly_name: "tel", type: "string" },
          ],
          rows: [
            { id: 1, name: "User One", tel: "03-1111-2222" },
            { id: 2, name: "User Two", tel: "03-3333-4444" },
          ],
          runtime: 0.1,
          retrieved_at: "2025-01-01T00:00:00Z",
        },
        status: 200,
        isSuccess: true,
        message: "OK",
      };

      const filtered = filterList.executeSql(mockSqlResult);

      // 1行目
      expect(filtered.payload.rows[0]!["name"]).toBe("User One"); // nameはマスク対象外
      expect(filtered.payload.rows[0]!["tel"]).toBe("******2222");

      // 2行目
      expect(filtered.payload.rows[1]!["name"]).toBe("User Two"); // nameはマスク対象外
      expect(filtered.payload.rows[1]!["tel"]).toBe("******4444");
    });

    it("maskPii=trueの場合、executeSqlフィルターがPIIカラムがない場合はマスキングしないこと", () => {
      const filterList = makeRedashPrivacyFilterList(true);

      const mockSqlResult: Result<RedashExecuteSqlPayload> = {
        payload: {
          columns: [
            { name: "id", friendly_name: "id", type: "integer" },
            { name: "count", friendly_name: "count", type: "integer" },
          ],
          rows: [
            { id: 1, count: 100 },
            { id: 2, count: 200 },
          ],
          runtime: 0.1,
          retrieved_at: "2025-01-01T00:00:00Z",
        },
        status: 200,
        isSuccess: true,
        message: "OK",
      };

      const filtered = filterList.executeSql(mockSqlResult);

      // PIIカラムがないのでマスキングされない
      expect(filtered.payload.rows[0]!["id"]).toBe(1);
      expect(filtered.payload.rows[0]!["count"]).toBe(100);
      expect(filtered.payload.rows[1]!["id"]).toBe(2);
      expect(filtered.payload.rows[1]!["count"]).toBe(200);
    });

    it("maskPii=falseの場合、executeSqlフィルターが何もマスキングしないこと", () => {
      const filterList = makeRedashPrivacyFilterList(false);

      const mockSqlResult: Result<RedashExecuteSqlPayload> = {
        payload: {
          columns: [
            { name: "id", friendly_name: "id", type: "integer" },
            { name: "name", friendly_name: "name", type: "string" },
            { name: "email", friendly_name: "email", type: "string" },
          ],
          rows: [{ id: 1, name: "Test User", email: "test@example.com" }],
          runtime: 0.1,
          retrieved_at: "2025-01-01T00:00:00Z",
        },
        status: 200,
        isSuccess: true,
        message: "OK",
      };

      const filtered = filterList.executeSql(mockSqlResult);

      // マスキングされない
      expect(filtered.payload.rows[0]!["name"]).toBe("Test User");
      expect(filtered.payload.rows[0]!["email"]).toBe("test@example.com");
    });
  });
});
