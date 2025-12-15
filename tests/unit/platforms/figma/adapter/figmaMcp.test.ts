import { makeFigmaMcp } from "@platforms/figma/adapter/figmaMcp";
import { FigmaRepository } from "@platforms/figma/domain/repositories/figmaRepository";
import { WebRepository } from "@platforms/web/domain/repositories/webRepository";

describe("figmaMcp", () => {
  const mockFigmaRepository: FigmaRepository = {
    getImages: jest.fn().mockResolvedValue({
      payload: {
        err: null,
        images: { "2477:88756": "https://figma-cdn.example.com/image.png" },
      },
      status: 200,
      isSuccess: true,
      message: "ok",
    }),
    getComments: jest.fn().mockResolvedValue({
      payload: { comments: [] },
      status: 200,
      isSuccess: true,
      message: "ok",
    }),
    getFile: jest.fn().mockResolvedValue({
      payload: {
        name: "Test File",
        lastModified: "2026-01-01",
        thumbnailUrl: "",
        version: "1",
        document: { id: "0:0", name: "Document", type: "DOCUMENT" },
      },
      status: 200,
      isSuccess: true,
      message: "ok",
    }),
  };

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

  describe("makeF igmaMcp", () => {
    it("MCPオブジェクトを正しく作成できること", () => {
      const mcp = makeFigmaMcp({
        figmaRepository: mockFigmaRepository,
        webRepository: mockWebRepository,
      });

      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions.getImages).toBeDefined();
      expect(mcp.mcpFunctions.getImageAsBase64).toBeDefined();
      expect(mcp.mcpFunctions.getComments).toBeDefined();
      expect(mcp.mcpFunctions.getFile).toBeDefined();
      expect(mcp.mcpMetadata).toBeDefined();
      expect(mcp.mcpSetting).toBeDefined();
    });

    it("getImages関数が実行できること", async () => {
      const mcp = makeFigmaMcp({
        figmaRepository: mockFigmaRepository,
        webRepository: mockWebRepository,
      });

      const result = await mcp.mcpFunctions.getImages("fileKey123", [
        "2477-88756",
      ]);

      expect(mockFigmaRepository.getImages).toHaveBeenCalledWith(
        "fileKey123",
        ["2477-88756"],
        undefined,
        undefined,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.images["2477:88756"]).toBe(
        "https://figma-cdn.example.com/image.png",
      );
    });

    it("getImageAsBase64関数がFigma APIと画像取得を連携できること", async () => {
      const mcp = makeFigmaMcp({
        figmaRepository: mockFigmaRepository,
        webRepository: mockWebRepository,
      });

      const result = await mcp.mcpFunctions.getImageAsBase64(
        "fileKey123",
        "2477-88756",
      );

      expect(mockFigmaRepository.getImages).toHaveBeenCalledWith(
        "fileKey123",
        ["2477-88756"],
        undefined,
        undefined,
      );
      expect(mockWebRepository.fetchImage).toHaveBeenCalledWith(
        "https://figma-cdn.example.com/image.png",
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.base64).toBe("iVBORw0KGgo=");
    });

    it("getImageAsBase64でFigma APIが失敗した場合エラーを返すこと", async () => {
      const failingFigmaRepo: FigmaRepository = {
        ...mockFigmaRepository,
        getImages: jest.fn().mockResolvedValue({
          payload: null,
          status: 403,
          isSuccess: false,
          message: "Forbidden",
        }),
      };

      const mcp = makeFigmaMcp({
        figmaRepository: failingFigmaRepo,
        webRepository: mockWebRepository,
      });

      const result = await mcp.mcpFunctions.getImageAsBase64(
        "fileKey123",
        "2477-88756",
      );

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(403);
    });

    it("getComments関数が実行できること", async () => {
      const mcp = makeFigmaMcp({
        figmaRepository: mockFigmaRepository,
        webRepository: mockWebRepository,
      });

      const result = await mcp.mcpFunctions.getComments("fileKey123");

      expect(mockFigmaRepository.getComments).toHaveBeenCalledWith(
        "fileKey123",
      );
      expect(result.isSuccess).toBe(true);
    });

    it("getFile関数が実行できること", async () => {
      const mcp = makeFigmaMcp({
        figmaRepository: mockFigmaRepository,
        webRepository: mockWebRepository,
      });

      const result = await mcp.mcpFunctions.getFile("fileKey123");

      expect(mockFigmaRepository.getFile).toHaveBeenCalledWith(
        "fileKey123",
        undefined,
        1,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.name).toBe("Test File");
    });
  });
});
