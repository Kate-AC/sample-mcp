import axios from "axios";
import { ErrorType, Result } from "@core/result/result";
import { WebRepository } from "@platforms/web/domain/repositories/webRepository";
import { WebFetchImagePayload } from "@platforms/web/domain/repositories/webRepositoryPayload";
import {
  WebConfig,
  loadWebConfig,
} from "@platforms/web/domain/settings/webConfig";

const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const makeWebRepository = (
  config: WebConfig = loadWebConfig(),
): WebRepository => ({
  fetchImage: async (url: string): Promise<Result<WebFetchImagePayload>> => {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: config.timeout,
        maxContentLength: config.maxImageSize,
      });

      const contentType =
        response.headers["content-type"]?.split(";")[0]?.trim() || "";

      if (!SUPPORTED_MIME_TYPES.includes(contentType)) {
        return {
          payload: null as unknown as WebFetchImagePayload,
          status: 415,
          isSuccess: false,
          message: `サポートされていないMIMEタイプです: ${contentType}。サポート対象: ${SUPPORTED_MIME_TYPES.join(", ")}`,
          errorType: ErrorType.OTHER_ERROR,
        };
      }

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString("base64");

      return {
        payload: {
          base64,
          mimeType: contentType,
          size: buffer.length,
        },
        status: response.status,
        isSuccess: true,
        message: "ok",
      };
    } catch (error) {
      return {
        payload: null as unknown as WebFetchImagePayload,
        status: 500,
        isSuccess: false,
        message: error instanceof Error ? error.message : String(error),
        errorType: ErrorType.OTHER_ERROR,
      };
    }
  },
});
