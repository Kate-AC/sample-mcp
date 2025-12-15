import { loadTitanEnv } from "@aiModels/titan/infrastructure/env/titanEnv";
import { makeTitanApiClient } from "@aiModels/titan/infrastructure/http/titanApiClient";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

jest.mock("@aiModels/titan/infrastructure/env/titanEnv");
jest.mock("@aws-sdk/client-bedrock-runtime");

describe("titanApiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeTitanApiClient", () => {
    it("BedrockRuntimeClientが作成できること", () => {
      const mockEnv = {
        awsAccessKeyId: "test-access-key",
        awsSecretAccessKey: "test-secret-key",
        awsRegion: "ap-northeast-1",
        awsProfile: "default",
        awsBearerTokenBedrock: "",
      };

      (loadTitanEnv as jest.Mock).mockReturnValue(mockEnv);

      const client = makeTitanApiClient(mockEnv);

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(BedrockRuntimeClient);
    });

    it("環境変数に基づいて認証設定が行われること", () => {
      const mockEnv = {
        awsAccessKeyId: "test-access-key",
        awsSecretAccessKey: "test-secret-key",
        awsRegion: "us-east-1",
        awsProfile: "default",
        awsBearerTokenBedrock: "",
      };

      (loadTitanEnv as jest.Mock).mockReturnValue(mockEnv);

      const client = makeTitanApiClient(mockEnv);

      expect(client).toBeDefined();
      expect(BedrockRuntimeClient).toHaveBeenCalledWith(
        expect.objectContaining({
          region: "us-east-1",
        }),
      );
    });
  });
});
