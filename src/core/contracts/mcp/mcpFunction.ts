import { Result } from "@core/result/result";

export type McpFunction<T = unknown, U extends unknown[] = any[]> = (
  ...args: U
) => Promise<Result<T>>;
