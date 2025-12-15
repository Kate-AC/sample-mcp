import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import { ErrorType } from "@core/result/result";
import { WebFetchImagePayload } from "../../web/domain/repositories/webRepositoryPayload";
import { makeWebRepository } from "../../web/infrastructure/repositories/webRepository";
import {
  FigmaCommentsPayload,
  FigmaFilePayload,
  FigmaImagePayload,
} from "../domain/repositories/figmaRepositoryPayload";
import { makeFigmaRepository } from "../infrastructure/repositories/figmaRepository";
import { makeFigmaMcpMetadata } from "./figmaMcpMetadata";
import { makeFigmaMcpSetting } from "./figmaMcpSetting";

type FigmaMcpFunctions = {
  getImages: McpFunction<
    FigmaImagePayload,
    [string, string | string[], string?, number?]
  >;
  getImageAsBase64: McpFunction<
    WebFetchImagePayload,
    [string, string, string?, number?]
  >;
  getComments: McpFunction<FigmaCommentsPayload, [string]>;
  getFile: McpFunction<FigmaFilePayload, [string, string?, number?]>;
};

export const makeFigmaMcp = ({
  figmaRepository = makeFigmaRepository(),
  webRepository = makeWebRepository(),
} = {}): Mcp<FigmaMcpFunctions> => ({
  mcpFunctions: {
    getImages: async (
      fileKey: string,
      nodeIds: string | string[],
      format?: string,
      scale?: number,
    ) => {
      const ids = Array.isArray(nodeIds) ? nodeIds : nodeIds.split(",");
      return figmaRepository.getImages(fileKey, ids, format, scale);
    },

    getImageAsBase64: async (
      fileKey: string,
      nodeId: string,
      format?: string,
      scale?: number,
    ) => {
      const imageResult = await figmaRepository.getImages(
        fileKey,
        [nodeId],
        format,
        scale,
      );

      if (!imageResult.isSuccess) {
        return {
          payload: null as unknown as WebFetchImagePayload,
          status: imageResult.status,
          isSuccess: false as const,
          message: imageResult.message || "画像URLの取得に失敗しました",
          errorType: ErrorType.OTHER_ERROR,
        };
      }

      const nodeIdNormalized = nodeId.replace("-", ":");
      const imageUrl = imageResult.payload.images[nodeIdNormalized];

      if (!imageUrl) {
        return {
          payload: null as unknown as WebFetchImagePayload,
          status: 404,
          isSuccess: false as const,
          message: `ノード "${nodeId}" の画像URLが取得できませんでした`,
          errorType: ErrorType.OTHER_ERROR,
        };
      }

      return webRepository.fetchImage(imageUrl);
    },

    getComments: async (fileKey: string) => {
      return figmaRepository.getComments(fileKey);
    },

    getFile: async (fileKey: string, nodeId?: string, depth: number = 1) => {
      return figmaRepository.getFile(fileKey, nodeId, depth);
    },
  },
  mcpMetadata: makeFigmaMcpMetadata(),
  mcpSetting: makeFigmaMcpSetting(),
});
