import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { makeAiModelApiClient } from "@infrastructure/shared/aiModelApiClient";
import { loadAiModelEnv } from "@infrastructure/shared/aiModelEnv";

jest.mock("@infrastructure/shared/aiModelEnv");
jest.mock("@aws-sdk/client-bedrock-runtime");

describe("aiModelApiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeAiModelApiClient", () => {
    it("BedrockRuntimeClientが作成できること", () => {
      const mockEnv = {
        awsAccessKeyId: "test-access-key",
        awsSecretAccessKey: "test-secret-key",
        awsRegion: "ap-northeast-1",
        awsProfile: "dev-admin",
        awsBearerTokenBedrock: "",
      };

      (loadAiModelEnv as jest.Mock).mockReturnValue(mockEnv);

      const client = makeAiModelApiClient(mockEnv);

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

      (loadAiModelEnv as jest.Mock).mockReturnValue(mockEnv);

      const client = makeAiModelApiClient(mockEnv);

      expect(client).toBeDefined();
      expect(BedrockRuntimeClient).toHaveBeenCalledWith(
        expect.objectContaining({
          region: "us-east-1",
        }),
      );
    });

    it("Bearer Token認証が優先されること", () => {
      const mockEnv = {
        awsAccessKeyId: "test-access-key",
        awsSecretAccessKey: "test-secret-key",
        awsRegion: "ap-northeast-1",
        awsProfile: "dev-admin",
        awsBearerTokenBedrock: "bearer-token-xxx",
      };

      (loadAiModelEnv as jest.Mock).mockReturnValue(mockEnv);

      const client = makeAiModelApiClient(mockEnv);

      expect(client).toBeDefined();
      expect(BedrockRuntimeClient).toHaveBeenCalledWith(
        expect.objectContaining({
          credentials: expect.objectContaining({
            accessKeyId: "bearer-token-xxx",
            secretAccessKey: "unused",
          }),
        }),
      );
    });
  });
});
