import { makeWebMcp } from "@platforms/web/adapter/webMcp";
import { WebRepository } from "@platforms/web/domain/repositories/webRepository";

describe("webMcp", () => {
  describe("makeWebMcp", () => {
    it("MCPオブジェクトを正しく作成できること", () => {
      const mcp = makeWebMcp({});

      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpFunctions.fetchImage).toBeDefined();
      expect(mcp.mcpMetadata).toBeDefined();
      expect(mcp.mcpSetting).toBeDefined();
    });

    it("fetchImage関数が実行できること", async () => {
      const mockWebRepository: WebRepository = {
        fetchImage: jest.fn().mockResolvedValue({
          payload: {
            base64: "iVBORw0KGgo=",
            mimeType: "image/png",
            size: 1024,
          },
          status: 200,
          isSuccess: true,
          message: "ok",
        }),
      };

      const mcp = makeWebMcp({ webRepository: mockWebRepository });
      const result = await mcp.mcpFunctions.fetchImage(
        "https://example.com/image.png",
      );

      expect(mockWebRepository.fetchImage).toHaveBeenCalledWith(
        "https://example.com/image.png",
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.base64).toBe("iVBORw0KGgo=");
      expect(result.payload.mimeType).toBe("image/png");
    });
  });
});
