import { makeGrowiMcp } from "@platforms/growi/adapter/growiMcp";
import { GrowiRepository } from "@platforms/growi/domain/repositories/growiRepository";

describe("growiMcp", () => {
  describe("makeGrowiMcp", () => {
    it("MCPオブジェクトを正しく作成できること", () => {
      const mcp = makeGrowiMcp({});

      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpFunctions.searchPages).toBeDefined();
      expect(mcp.mcpFunctions.getPage).toBeDefined();
      expect(mcp.mcpFunctions.createPage).toBeDefined();
    });

    it("searchPages関数が実行できること", async () => {
      const mockRepository: GrowiRepository = {
        getPages: jest.fn(),
        getPage: jest.fn(),
        searchPages: jest.fn().mockResolvedValue({
          payload: { data: [] },
          isSuccess: true,
        }),
        getRevisions: jest.fn(),
        getUsers: jest.fn(),
        getComments: jest.fn(),
        getAttachments: jest.fn(),
        createPage: jest.fn(),
      };

      const mcp = makeGrowiMcp({
        growiRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.searchPages("楽天");

      expect(mockRepository.searchPages).toHaveBeenCalledWith("/_api/search", {
        q: "楽天",
      });
      expect(result.isSuccess).toBe(true);
    });

    it("getPage関数が実行できること", async () => {
      const mockRepository: GrowiRepository = {
        getPages: jest.fn(),
        getPage: jest.fn().mockResolvedValue({
          payload: {
            _id: "test-id",
            path: "/test",
            revision: { body: "test content" },
          },
          isSuccess: true,
        }),
        searchPages: jest.fn(),
        getRevisions: jest.fn(),
        getUsers: jest.fn(),
        getComments: jest.fn(),
        getAttachments: jest.fn(),
        createPage: jest.fn(),
      };

      const mcp = makeGrowiMcp({
        growiRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.getPage("test-id");

      expect(mockRepository.getPage).toHaveBeenCalledWith("/_api/v3/page", {
        pageId: "test-id",
      });
      expect(result.isSuccess).toBe(true);
    });

    it("createPage関数が実行できること", async () => {
      const mockRepository: GrowiRepository = {
        getPages: jest.fn(),
        getPage: jest.fn(),
        searchPages: jest.fn(),
        getRevisions: jest.fn(),
        getUsers: jest.fn(),
        getComments: jest.fn(),
        getAttachments: jest.fn(),
        createPage: jest.fn().mockResolvedValue({
          payload: { page: { _id: "test-id", path: "/generated_by_ai/test" } },
          isSuccess: true,
        }),
      };

      const mcp = makeGrowiMcp({
        growiRepositoryFactory: mockRepository,
      });

      const result = await mcp.mcpFunctions.createPage(
        "テスト記事",
        "# テスト\\n\\n内容",
      );

      expect(mockRepository.createPage).toHaveBeenCalledWith(
        "/_api/v3/page",
        expect.objectContaining({
          body: "# テスト\\n\\n内容",
          path: expect.stringContaining("/generated_by_ai/"),
        }),
      );
      expect(result.isSuccess).toBe(true);
    });
  });
});
