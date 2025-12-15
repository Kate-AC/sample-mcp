import { loadClaudeEnv } from "@aiModels/claude/infrastructure/env/claudeEnv";

describe("claudeEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("loadClaudeEnv", () => {
    it("環境変数からAWS認証情報を読み込むこと", () => {
      process.env["AWS_ACCESS_KEY_ID"] = "test-access-key";
      process.env["AWS_SECRET_ACCESS_KEY"] = "test-secret-key";
      process.env["AWS_REGION"] = "ap-northeast-1";

      const env = loadClaudeEnv();

      expect(env.awsAccessKeyId).toBe("test-access-key");
      expect(env.awsSecretAccessKey).toBe("test-secret-key");
      expect(env.awsRegion).toBe("ap-northeast-1");
    });

    it("AWS_BEARER_TOKEN_BEDROCKが設定されている場合は使用できること", () => {
      delete process.env["AWS_ACCESS_KEY_ID"];
      delete process.env["AWS_SECRET_ACCESS_KEY"];
      delete process.env["AWS_PROFILE"];
      process.env["AWS_BEARER_TOKEN_BEDROCK"] = "bedrock-api-key-xxx";

      const env = loadClaudeEnv();

      expect(env.awsBearerTokenBedrock).toBe("bedrock-api-key-xxx");
    });

    it("AWS認証情報が設定されていない場合でもデフォルトプロファイルがあればOK", () => {
      delete process.env["AWS_ACCESS_KEY_ID"];
      delete process.env["AWS_SECRET_ACCESS_KEY"];
      delete process.env["AWS_PROFILE"];
      delete process.env["AWS_BEARER_TOKEN_BEDROCK"];

      // デフォルトプロファイル"dev-admin"が設定されるのでエラーにならない
      const env = loadClaudeEnv();
      expect(env.awsProfile).toBe("dev-admin");
    });

    it("AWS_PROFILEが設定されている場合は認証情報なしでもOK", () => {
      delete process.env["AWS_ACCESS_KEY_ID"];
      delete process.env["AWS_SECRET_ACCESS_KEY"];
      process.env["AWS_PROFILE"] = "dev-admin";

      const env = loadClaudeEnv();

      expect(env.awsAccessKeyId).toBe("");
      expect(env.awsSecretAccessKey).toBe("");
      expect(env.awsRegion).toBe("ap-northeast-1");
      expect(env.awsProfile).toBe("dev-admin");
    });

    it("デフォルトプロファイルが使用されること", () => {
      delete process.env["AWS_ACCESS_KEY_ID"];
      delete process.env["AWS_SECRET_ACCESS_KEY"];
      delete process.env["AWS_PROFILE"];

      const env = loadClaudeEnv();

      expect(env.awsAccessKeyId).toBe("");
      expect(env.awsSecretAccessKey).toBe("");
      expect(env.awsRegion).toBe("ap-northeast-1");
      expect(env.awsProfile).toBe("dev-admin");
    });

    it("正しい環境変数オブジェクトを返すこと", () => {
      process.env["AWS_ACCESS_KEY_ID"] = "valid-access-key";
      process.env["AWS_SECRET_ACCESS_KEY"] = "valid-secret-key";
      process.env["AWS_REGION"] = "us-east-1";

      const env = loadClaudeEnv();

      expect(env).toBeDefined();
      expect(env).toHaveProperty("awsAccessKeyId");
      expect(env).toHaveProperty("awsSecretAccessKey");
      expect(env).toHaveProperty("awsRegion");
    });

    it("AWS_REGIONが未設定の場合はデフォルト値を使用すること", () => {
      process.env["AWS_ACCESS_KEY_ID"] = "valid-access-key";
      process.env["AWS_SECRET_ACCESS_KEY"] = "valid-secret-key";
      delete process.env["AWS_REGION"];

      const env = loadClaudeEnv();

      expect(env.awsRegion).toBe("ap-northeast-1");
    });
  });
});
