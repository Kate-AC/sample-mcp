import { Result } from "@core/result/result";

export type AiModelFunction<T = unknown, U extends unknown[] = any[]> = (
  ...args: U
) => Promise<Result<T>>;
