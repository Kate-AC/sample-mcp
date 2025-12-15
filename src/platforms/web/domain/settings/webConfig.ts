export type WebConfig = {
  /** 画像取得時のタイムアウト（ミリ秒） */
  timeout: number;
  /** 画像の最大サイズ（バイト） */
  maxImageSize: number;
};

export const loadWebConfig = (): WebConfig => {
  return {
    timeout: 30000,
    maxImageSize: 10 * 1024 * 1024, // 10MB
  };
};
