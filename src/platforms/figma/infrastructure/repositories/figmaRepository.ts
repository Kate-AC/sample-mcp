import { ApiClientPort } from "@core/contracts/application/apiClientPort";
import { safeCall } from "@core/result/safeCall";
import { FigmaRepository } from "@platforms/figma/domain/repositories/figmaRepository";
import {
  FigmaCommentsPayload,
  FigmaFilePayload,
  FigmaImagePayload,
} from "@platforms/figma/domain/repositories/figmaRepositoryPayload";
import { makeFigmaApiClient } from "../http/figmaApiClient";

export const makeFigmaRepository = (
  apiClientFactory: () => ApiClientPort = makeFigmaApiClient,
): FigmaRepository => ({
  getImages: async (
    fileKey: string,
    nodeIds: string[],
    format: string = "png",
    scale: number = 2,
  ) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<FigmaImagePayload>(`/images/${fileKey}`, {
        ids: nodeIds.join(","),
        format,
        scale: String(scale),
      });
    });
  },

  getComments: async (fileKey: string) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      return await client.get<FigmaCommentsPayload>(
        `/files/${fileKey}/comments`,
      );
    });
  },

  getFile: async (fileKey: string, nodeId?: string, depth?: number) => {
    return safeCall(async () => {
      const client = apiClientFactory();
      const params: Record<string, string> = {};
      if (nodeId) {
        params["ids"] = nodeId;
      }
      if (depth !== undefined) {
        params["depth"] = String(depth);
      }
      return await client.get<FigmaFilePayload>(`/files/${fileKey}`, params);
    });
  },
});
