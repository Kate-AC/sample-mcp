/**
 * Playwright操作のレスポンスペイロード型定義
 */

/**
 * ページ遷移のレスポンス
 */
export interface PlaywrightNavigatePayload {
  url: string;
  title: string;
}

/**
 * クリック操作のレスポンス
 */
export interface PlaywrightClickPayload {
  selector: string;
  success: boolean;
}

/**
 * テキスト入力のレスポンス
 */
export interface PlaywrightTypePayload {
  selector: string;
  text: string;
  success: boolean;
}

/**
 * スクリーンショットのレスポンス
 */
export interface PlaywrightScreenshotPayload {
  /** Base64エンコードされた画像データ */
  base64: string;
  /** 保存先パス（指定された場合） */
  path?: string;
}

/**
 * ページスナップショット（アクセシビリティツリー）のレスポンス
 */
export interface PlaywrightSnapshotPayload {
  url: string;
  title: string;
  /** アクセシビリティツリーのテキスト表現 */
  snapshot: string;
}

/**
 * JavaScript実行のレスポンス
 */
export interface PlaywrightEvaluatePayload {
  result: unknown;
}

/**
 * ページテキストコンテンツ取得のレスポンス
 */
export interface PlaywrightGetTextContentPayload {
  url: string;
  title: string;
  content: string;
}

/**
 * 要素待機のレスポンス
 */
export interface PlaywrightWaitForSelectorPayload {
  selector: string;
  found: boolean;
}

/**
 * セレクトボックス選択のレスポンス
 */
export interface PlaywrightSelectOptionPayload {
  selector: string;
  values: string[];
  success: boolean;
}
