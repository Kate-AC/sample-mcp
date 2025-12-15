import { makePlaywrightMcp } from "@platforms/playwright/adapter/playwrightMcp";
import { PlaywrightRepository } from "@platforms/playwright/domain/repositories/playwrightRepository";

const createMockRepository = (
  overrides: Partial<PlaywrightRepository> = {},
): PlaywrightRepository => ({
  navigate: jest.fn().mockResolvedValue({
    payload: { url: "https://example.com", title: "Example" },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  click: jest.fn().mockResolvedValue({
    payload: { selector: "button", success: true },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  type: jest.fn().mockResolvedValue({
    payload: { selector: "input", text: "hello", success: true },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  screenshot: jest.fn().mockResolvedValue({
    payload: { base64: "abc123", path: "/tmp/screenshot.png" },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  snapshot: jest.fn().mockResolvedValue({
    payload: { url: "", title: "", snapshot: "snapshot-data" },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  evaluate: jest.fn().mockResolvedValue({
    payload: { result: "eval-result" },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  getTextContent: jest.fn().mockResolvedValue({
    payload: { url: "", title: "", content: "text content" },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  waitForSelector: jest.fn().mockResolvedValue({
    payload: { selector: "div", found: true },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  selectOption: jest.fn().mockResolvedValue({
    payload: { selector: "select", values: ["a"], success: true },
    status: 200,
    isSuccess: true,
    message: "ok",
  }),
  ...overrides,
});

describe("playwrightMcp", () => {
  describe("makePlaywrightMcp", () => {
    it("MCPオブジェクトを正しく作成できること", () => {
      const mockRepository = createMockRepository();
      const mcp = makePlaywrightMcp({ repository: mockRepository });

      expect(mcp).toBeDefined();
      expect(mcp.mcpFunctions).toBeDefined();
      expect(mcp.mcpFunctions.navigate).toBeDefined();
      expect(mcp.mcpFunctions.click).toBeDefined();
      expect(mcp.mcpFunctions.type).toBeDefined();
      expect(mcp.mcpFunctions.screenshot).toBeDefined();
      expect(mcp.mcpFunctions.snapshot).toBeDefined();
      expect(mcp.mcpFunctions.evaluate).toBeDefined();
      expect(mcp.mcpFunctions.getTextContent).toBeDefined();
      expect(mcp.mcpFunctions.waitForSelector).toBeDefined();
      expect(mcp.mcpFunctions.selectOption).toBeDefined();
    });

    it("navigate関数がリポジトリを呼び出すこと", async () => {
      const mockRepository = createMockRepository();
      const mcp = makePlaywrightMcp({ repository: mockRepository });

      const result = await mcp.mcpFunctions.navigate("https://example.com");

      expect(mockRepository.navigate).toHaveBeenCalledWith(
        "https://example.com",
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.url).toBe("https://example.com");
    });

    it("click関数がリポジトリを呼び出すこと", async () => {
      const mockRepository = createMockRepository();
      const mcp = makePlaywrightMcp({ repository: mockRepository });

      const result = await mcp.mcpFunctions.click("ログイン");

      expect(mockRepository.click).toHaveBeenCalledWith("ログイン");
      expect(result.isSuccess).toBe(true);
    });

    it("type関数がリポジトリを呼び出すこと", async () => {
      const mockRepository = createMockRepository();
      const mcp = makePlaywrightMcp({ repository: mockRepository });

      const result = await mcp.mcpFunctions.type("input", "test@example.com");

      expect(mockRepository.type).toHaveBeenCalledWith(
        "input",
        "test@example.com",
      );
      expect(result.isSuccess).toBe(true);
    });

    it("screenshot関数がリポジトリを呼び出すこと", async () => {
      const mockRepository = createMockRepository();
      const mcp = makePlaywrightMcp({ repository: mockRepository });

      const result = await mcp.mcpFunctions.screenshot();

      expect(mockRepository.screenshot).toHaveBeenCalledWith(undefined);
      expect(result.isSuccess).toBe(true);
      expect(result.payload.base64).toBe("abc123");
    });

    it("evaluate関数がリポジトリを呼び出すこと", async () => {
      const mockRepository = createMockRepository();
      const mcp = makePlaywrightMcp({ repository: mockRepository });

      const result = await mcp.mcpFunctions.evaluate("() => document.title");

      expect(mockRepository.evaluate).toHaveBeenCalledWith(
        "() => document.title",
      );
      expect(result.isSuccess).toBe(true);
      expect(result.payload.result).toBe("eval-result");
    });

    it("selectOption関数がリポジトリを呼び出すこと", async () => {
      const mockRepository = createMockRepository();
      const mcp = makePlaywrightMcp({ repository: mockRepository });

      const result = await mcp.mcpFunctions.selectOption("#status", ["active"]);

      expect(mockRepository.selectOption).toHaveBeenCalledWith("#status", [
        "active",
      ]);
      expect(result.isSuccess).toBe(true);
    });
  });
});
