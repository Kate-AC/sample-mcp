import { config } from "dotenv";
import * as path from "path";

config({ path: path.resolve(process.cwd(), ".env") });

/**
 * 環境変数を取得する実装
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}
