import { getEnv } from "@infrastructure/shared/env";

describe("env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 各テストの前に環境変数をリセット
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // テスト終了後に環境変数を復元
    process.env = originalEnv;
  });

  describe("getEnv", () => {
    it("環境変数が存在する場合、その値を返すこと", () => {
      process.env["TEST_VAR"] = "test-value";

      const value = getEnv("TEST_VAR");

      expect(value).toBe("test-value");
    });

    it("環境変数が存在しない場合、デフォルト値を返すこと", () => {
      delete process.env["TEST_VAR"];

      const value = getEnv("TEST_VAR", "default-value");

      expect(value).toBe("default-value");
    });

    it("環境変数が存在せず、デフォルト値も無い場合、エラーをスローすること", () => {
      delete process.env["TEST_VAR"];

      expect(() => {
        getEnv("TEST_VAR");
      }).toThrow("Environment variable TEST_VAR is not defined");
    });

    it("空文字列の環境変数も正しく返すこと", () => {
      process.env["EMPTY_VAR"] = "";

      const value = getEnv("EMPTY_VAR");

      expect(value).toBe("");
    });

    it("数値の環境変数も文字列として返すこと", () => {
      process.env["NUMBER_VAR"] = "123";

      const value = getEnv("NUMBER_VAR");

      expect(value).toBe("123");
      expect(typeof value).toBe("string");
    });

    it("複数の環境変数を取得できること", () => {
      process.env["VAR1"] = "value1";
      process.env["VAR2"] = "value2";
      process.env["VAR3"] = "value3";

      const value1 = getEnv("VAR1");
      const value2 = getEnv("VAR2");
      const value3 = getEnv("VAR3");

      expect(value1).toBe("value1");
      expect(value2).toBe("value2");
      expect(value3).toBe("value3");
    });

    it("デフォルト値として空文字列を指定できること", () => {
      delete process.env["TEST_VAR"];

      const value = getEnv("TEST_VAR", "");

      expect(value).toBe("");
    });

    it("環境変数がundefinedの場合とnullの場合を区別すること", () => {
      delete process.env["UNDEFINED_VAR"];

      expect(() => {
        getEnv("UNDEFINED_VAR");
      }).toThrow();

      // 注: process.envはnullを許容しないため、undefinedのみテスト
    });

    it("特殊文字を含む環境変数も正しく取得できること", () => {
      process.env["SPECIAL_VAR"] = "value-with-special_chars@123";

      const value = getEnv("SPECIAL_VAR");

      expect(value).toBe("value-with-special_chars@123");
    });

    it("URLやパスなどの長い文字列も正しく取得できること", () => {
      process.env["URL_VAR"] =
        "https://example.com/api/v1/users?page=1&limit=10";

      const value = getEnv("URL_VAR");

      expect(value).toBe("https://example.com/api/v1/users?page=1&limit=10");
    });
  });
});
