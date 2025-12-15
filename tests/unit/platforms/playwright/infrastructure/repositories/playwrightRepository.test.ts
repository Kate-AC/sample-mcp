import { makePlaywrightMcpClient } from "@platforms/playwright/infrastructure/http/playwrightMcpClient";
import { makePlaywrightRepository } from "@platforms/playwright/infrastructure/repositories/playwrightRepository";

jest.mock("@platforms/playwright/infrastructure/http/playwrightMcpClient");
jest.mock("fs");

describe("playwrightRepository", () => {
  const mockCallTool = jest.fn();
  const mockInitialize = jest.fn().mockResolvedValue("test-session");

  beforeEach(() => {
    jest.clearAllMocks();
    (makePlaywrightMcpClient as jest.Mock).mockReturnValue({
      callTool: mockCallTool,
      initialize: mockInitialize,
    });
  });

  describe("navigate", () => {
    it("navigateが成功すること", async () => {
      mockCallTool.mockResolvedValueOnce({ content: null, isError: false });

      const repo = makePlaywrightRepository("http://localhost:8931");
      const result = await repo.navigate("https://example.com");

      expect(result.isSuccess).toBe(true);
      expect(result.payload.url).toBe("https://example.com");
      expect(mockCallTool).toHaveBeenCalledWith("browser_navigate", {
        url: "https://example.com",
      });
    });

    it("navigateが失敗した場合エラーを返すこと", async () => {
      mockCallTool.mockRejectedValue(new Error("Connection refused"));

      const repo = makePlaywrightRepository("http://localhost:8931");
      const result = await repo.navigate("https://example.com");

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Failed to navigate");
    });
  });

  describe("click", () => {
    it("clickが成功すること", async () => {
      mockCallTool.mockResolvedValue({ content: null, isError: false });

      const repo = makePlaywrightRepository("http://localhost:8931");
      const result = await repo.click("ログイン");

      expect(result.isSuccess).toBe(true);
      expect(result.payload.selector).toBe("ログイン");
      expect(result.payload.success).toBe(true);
    });
  });

  describe("type", () => {
    it("typeが成功すること", async () => {
      mockCallTool.mockResolvedValue({ content: null, isError: false });

      const repo = makePlaywrightRepository("http://localhost:8931");
      const result = await repo.type("input", "hello");

      expect(result.isSuccess).toBe(true);
      expect(result.payload.text).toBe("hello");
    });
  });

  describe("evaluate", () => {
    it("evaluateが成功すること", async () => {
      mockCallTool.mockResolvedValue({
        content: "evaluated result",
        isError: false,
      });

      const repo = makePlaywrightRepository("http://localhost:8931");
      const result = await repo.evaluate("() => document.title");

      expect(result.isSuccess).toBe(true);
      expect(result.payload.result).toBe("evaluated result");
      expect(mockCallTool).toHaveBeenCalledWith("browser_evaluate", {
        function: "() => document.title",
      });
    });
  });

  describe("snapshot", () => {
    it("snapshotが成功すること", async () => {
      mockCallTool.mockResolvedValue({
        content: "accessibility-tree",
        isError: false,
      });

      const repo = makePlaywrightRepository("http://localhost:8931");
      const result = await repo.snapshot();

      expect(result.isSuccess).toBe(true);
      expect(result.payload.snapshot).toBe("accessibility-tree");
    });
  });

  describe("waitForSelector", () => {
    it("waitForSelectorが成功すること", async () => {
      mockCallTool.mockResolvedValue({ content: null, isError: false });

      const repo = makePlaywrightRepository("http://localhost:8931");
      const result = await repo.waitForSelector("div.loaded", 5000);

      expect(result.isSuccess).toBe(true);
      expect(result.payload.found).toBe(true);
      expect(mockCallTool).toHaveBeenCalledWith("browser_wait_for", {
        selector: "div.loaded",
        timeout: 5000,
      });
    });
  });

  describe("selectOption", () => {
    it("selectOptionが成功すること", async () => {
      mockCallTool.mockResolvedValue({ content: null, isError: false });

      const repo = makePlaywrightRepository("http://localhost:8931");
      const result = await repo.selectOption("#status", ["active"]);

      expect(result.isSuccess).toBe(true);
      expect(result.payload.values).toEqual(["active"]);
    });
  });
});
