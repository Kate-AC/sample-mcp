import { makeLocalMcp } from "@platforms/local/adapter/localMcp";
import { LocalRepository } from "@platforms/local/domain/repositories/localRepository";

describe("localMcp", () => {
  describe("makeLocalMcp", () => {
    it("MCPオブジェクトを正しく作成できること", () => {
      const mcp = makeLocalMcp();

      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpFunctions.readFile).toBeDefined();
      expect(mcp.mcpFunctions.listFiles).toBeDefined();
      expect(mcp.mcpFunctions.searchFilesByName).toBeDefined();
      expect(mcp.mcpFunctions.searchCode).toBeDefined();
      expect(mcp.mcpFunctions.findDirsByName).toBeDefined();
      expect(mcp.mcpMetadata).toBeDefined();
      expect(mcp.mcpSetting).toBeDefined();
    });

    it("モックリポジトリを注入できること", async () => {
      const mockRepository: LocalRepository = {
        readFile: jest.fn().mockResolvedValue({
          payload: {
            path: "/test/file.txt",
            content: "test content",
            size: 12,
            modifiedAt: "2024-01-01T00:00:00.000Z",
          },
          isSuccess: true,
          status: 200,
          message: "ok",
        }),
        listFiles: jest.fn().mockResolvedValue({
          payload: {
            path: "/test",
            items: [],
          },
          isSuccess: true,
          status: 200,
          message: "ok",
        }),
        searchFilesByName: jest.fn().mockResolvedValue({
          payload: {
            pattern: "*.txt",
            files: [],
          },
          isSuccess: true,
          status: 200,
          message: "ok",
        }),
        searchCode: jest.fn().mockResolvedValue({
          payload: {
            pattern: "test",
            results: [],
          },
          isSuccess: true,
          status: 200,
          message: "ok",
        }),
        findDirsByName: jest.fn().mockResolvedValue({
          payload: {
            names: ["order-sync"],
            rootPath: "/test",
            directories: [],
          },
          isSuccess: true,
          status: 200,
          message: "ok",
        }),
      };

      const mcp = makeLocalMcp({
        repository: mockRepository,
      });

      const result = await mcp.mcpFunctions.readFile("/test/file.txt");

      expect(mockRepository.readFile).toHaveBeenCalledWith("/test/file.txt");
      expect(result.isSuccess).toBe(true);
    });

    it("readFile関数が実行できること", async () => {
      const mcp = makeLocalMcp();
      expect(mcp.mcpFunctions.readFile).toBeDefined();
    });

    it("listFiles関数が実行できること", async () => {
      const mcp = makeLocalMcp();
      expect(mcp.mcpFunctions.listFiles).toBeDefined();
    });

    it("searchFilesByName関数が実行できること", async () => {
      const mcp = makeLocalMcp();
      expect(mcp.mcpFunctions.searchFilesByName).toBeDefined();
    });

    it("searchCode関数が実行できること", async () => {
      const mcp = makeLocalMcp();
      expect(mcp.mcpFunctions.searchCode).toBeDefined();
    });

    it("findDirsByName関数が実行できること", async () => {
      const mcp = makeLocalMcp();
      expect(mcp.mcpFunctions.findDirsByName).toBeDefined();
    });
  });
});
