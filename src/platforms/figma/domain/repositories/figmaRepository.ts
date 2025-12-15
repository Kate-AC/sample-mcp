import { Result } from "@core/result/result";
import {
  FigmaCommentsPayload,
  FigmaFilePayload,
  FigmaImagePayload,
} from "./figmaRepositoryPayload";

export interface FigmaRepository {
  getImages: (
    fileKey: string,
    nodeIds: string[],
    format?: string,
    scale?: number,
  ) => Promise<Result<FigmaImagePayload>>;

  getComments: (fileKey: string) => Promise<Result<FigmaCommentsPayload>>;

  getFile: (
    fileKey: string,
    nodeId?: string,
    depth?: number,
  ) => Promise<Result<FigmaFilePayload>>;
}
