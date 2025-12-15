import axios from "axios";
import { makeWebRepository } from "@platforms/web/infrastructure/repositories/webRepository";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("webRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchImage", () => {
    it("画像を正常に取得してBase64で返すこと", async () => {
      const imageBuffer = Buffer.from("fake-png-data");
      mockedAxios.get.mockResolvedValue({
        data: imageBuffer,
        status: 200,
        headers: { "content-type": "image/png" },
      });

      const repository = makeWebRepository();
      const result = await repository.fetchImage(
        "https://example.com/image.png",
      );

      expect(result.isSuccess).toBe(true);
      expect(result.payload.mimeType).toBe("image/png");
      expect(result.payload.base64).toBe(imageBuffer.toString("base64"));
      expect(result.payload.size).toBe(imageBuffer.length);
    });

    it("サポートされていないMIMEタイプの場合エラーを返すこと", async () => {
      mockedAxios.get.mockResolvedValue({
        data: Buffer.from("text"),
        status: 200,
        headers: { "content-type": "text/html" },
      });

      const repository = makeWebRepository();
      const result = await repository.fetchImage("https://example.com/page");

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(415);
      expect(result.message).toContain("サポートされていないMIMEタイプ");
    });

    it("ネットワークエラーの場合エラーを返すこと", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network Error"));

      const repository = makeWebRepository();
      const result = await repository.fetchImage(
        "https://example.com/image.png",
      );

      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe("Network Error");
    });
  });
});
