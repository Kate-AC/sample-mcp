import { Result } from "@core/result/result";
import { WebFetchImagePayload } from "./webRepositoryPayload";

export interface WebRepository {
  fetchImage: (url: string) => Promise<Result<WebFetchImagePayload>>;
}
