import { Result } from "@core/result/result";
import {
  PlaywrightClickPayload,
  PlaywrightEvaluatePayload,
  PlaywrightGetTextContentPayload,
  PlaywrightNavigatePayload,
  PlaywrightScreenshotPayload,
  PlaywrightSelectOptionPayload,
  PlaywrightSnapshotPayload,
  PlaywrightTypePayload,
  PlaywrightWaitForSelectorPayload,
} from "./playwrightRepositoryPayload";

/**
 * Playwright操作のリポジトリインターフェース
 */
export interface PlaywrightRepository {
  /**
   * 指定URLに遷移する
   */
  navigate: (url: string) => Promise<Result<PlaywrightNavigatePayload>>;

  /**
   * 要素をクリックする（テキストベース or CSSセレクタ）
   */
  click: (selector: string) => Promise<Result<PlaywrightClickPayload>>;

  /**
   * 要素にテキストを入力する
   */
  type: (
    selector: string,
    text: string,
  ) => Promise<Result<PlaywrightTypePayload>>;

  /**
   * スクリーンショットを取得する
   */
  screenshot: (path?: string) => Promise<Result<PlaywrightScreenshotPayload>>;

  /**
   * ページのアクセシビリティスナップショットを取得する
   */
  snapshot: () => Promise<Result<PlaywrightSnapshotPayload>>;

  /**
   * JavaScriptを実行する
   */
  evaluate: (script: string) => Promise<Result<PlaywrightEvaluatePayload>>;

  /**
   * ページのテキストコンテンツを取得する
   */
  getTextContent: () => Promise<Result<PlaywrightGetTextContentPayload>>;

  /**
   * 要素が表示されるまで待機する
   */
  waitForSelector: (
    selector: string,
    timeout?: number,
  ) => Promise<Result<PlaywrightWaitForSelectorPayload>>;

  /**
   * セレクトボックスの値を選択する
   */
  selectOption: (
    selector: string,
    values: string[],
  ) => Promise<Result<PlaywrightSelectOptionPayload>>;
}
