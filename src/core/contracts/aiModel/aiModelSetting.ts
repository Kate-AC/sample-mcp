import { PlatformConfig } from "../platform/platformConfig";
import { PlatformEnv } from "../platform/platformEnv";

export interface AiModelSetting<
  T extends PlatformConfig = PlatformConfig,
  U extends PlatformEnv = PlatformEnv,
> {
  /**
   * 公開設定の取得
   */
  getConfig: () => Promise<T>;

  /**
   * 環境変数の取得（非公開）
   */
  getEnv: () => Promise<U>;
}
