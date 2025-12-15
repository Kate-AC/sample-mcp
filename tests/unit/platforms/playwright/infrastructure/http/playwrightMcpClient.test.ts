import axios from "axios";
import { makePlaywrightMcpClient } from "@platforms/playwright/infrastructure/http/playwrightMcpClient";

jest.mock("axios");
jest.mock("child_process", () => ({
  spawn: jest.fn(() => ({ unref: jest.fn() })),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("playwrightMcpClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialize", () => {
    it("MCPセッションを初期化できること", async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200 });

      const client = makePlaywrightMcpClient("http://localhost:8931");
      const result = await client.initialize();

      expect(result).toBe("proxy");
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8931/health",
        { timeout: 2000 },
      );
    });
  });

  describe("callTool", () => {
    it("ツール呼び出しが成功すること", async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200 });

      const client = makePlaywrightMcpClient("http://localhost:8931");
      await client.initialize();

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          result: {
            content: [{ type: "text", text: "navigation successful" }],
            isError: false,
          },
        },
      });

      const result = await client.callTool("browser_navigate", {
        url: "https://example.com",
      });

      expect(result.isError).toBe(false);
      expect(result.content).toBe("navigation successful");
    });

    it("JSONレスポンスをパースできること", async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200 });

      const client = makePlaywrightMcpClient("http://localhost:8931");
      await client.initialize();

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          result: {
            content: [{ type: "text", text: '{"url":"https://example.com"}' }],
            isError: false,
          },
        },
      });

      const result = await client.callTool("browser_navigate", {
        url: "https://example.com",
      });

      expect(result.isError).toBe(false);
      expect(result.content).toEqual({ url: "https://example.com" });
    });

    it("エラーレスポンスを処理できること", async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200 });

      const client = makePlaywrightMcpClient("http://localhost:8931");
      await client.initialize();

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          error: { code: -32600, message: "Tool not found" },
        },
      });

      const result = await client.callTool("invalid_tool", {});

      expect(result.isError).toBe(true);
      expect(result.content).toBe("Tool not found");
    });

    it("画像レスポンスを処理できること", async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200 });

      const client = makePlaywrightMcpClient("http://localhost:8931");
      await client.initialize();

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          result: {
            content: [
              {
                type: "image",
                data: "base64imagedata",
                mimeType: "image/png",
              },
            ],
            isError: false,
          },
        },
      });

      const result = await client.callTool<string>(
        "browser_take_screenshot",
        {},
      );

      expect(result.isError).toBe(false);
      expect(result.content).toBe("base64imagedata");
    });
  });
});
