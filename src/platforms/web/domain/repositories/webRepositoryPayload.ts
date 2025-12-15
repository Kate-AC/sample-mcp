import { ImageObject } from "@core/contracts/object/imageObject";

export type WebFetchImagePayload = ImageObject & {
  size: number;
};
