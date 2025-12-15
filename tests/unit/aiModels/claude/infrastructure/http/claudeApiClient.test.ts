import { loadClaudeEnv } from "@aiModels/claude/infrastructure/env/claudeEnv";
import { makeClaudeApiClient } from "@aiModels/claude/infrastructure/http/claudeApiClient";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

jest.mock("@aiModels/claude/infrastructure/env/claudeEnv");
jest.mock("@aws-sdk/client-bedrock-runtime");

describe("claudeApiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeClaudeApiClient", () => {
    it("BedrockRuntimeClientが作成できること", () => {
      const mockEnv = {
        awsAccessKeyId: "test-access-key",
        awsSecretAccessKey: "test-secret-key",
        awsRegion: "ap-northeast-1",
        awsProfile: "dev-admin",
        awsBearerTokenBedrock: "",
      };

      (loadClaudeEnv as jest.Mock).mockReturnValue(mockEnv);

      const client = makeClaudeApiClient(mockEnv);

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(BedrockRuntimeClient);
    });

    it("環境変数に基づいて認証設定が行われること", () => {
      const mockEnv = {
        awsAccessKeyId: "test-access-key",
        awsSecretAccessKey: "test-secret-key",
        awsRegion: "us-east-1",
        awsProfile: "dev-admin",
        awsBearerTokenBedrock: "",
      };

      (loadClaudeEnv as jest.Mock).mockReturnValue(mockEnv);

      const client = makeClaudeApiClient(mockEnv);

      expect(client).toBeDefined();
      expect(BedrockRuntimeClient).toHaveBeenCalledWith(
        expect.objectContaining({
          region: "us-east-1",
        }),
      );
    });
  });
});
