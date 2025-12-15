/**
 * コールバック関数の型定義
 * 前回の実行結果を受け取り、新しい結果を返す
 */
export type CallbackWithResult<T> = (previousResult?: T) => Promise<T>;

/**
 * リトライ戦略の設定
 */
export type RetryStrategy<T> = {
  /**
   * 最大リトライ回数
   */
  maxRetries: number;

  /**
   * エラーが発生した場合にリトライするかどうかを判定
   * @param error 発生したエラー
   * @param attempt 現在の試行回数（1から開始）
   * @param previousResult 前回の実行結果（存在する場合）
   * @returns trueの場合リトライ、falseの場合リトライしない（エラーをthrow）
   */
  shouldRetry: (error: unknown, attempt: number, previousResult?: T) => boolean;

  /**
   * リトライ前の待機時間を取得（ミリ秒）
   * @param error 発生したエラー
   * @param attempt 現在の試行回数（1から開始）
   * @param previousResult 前回の実行結果（存在する場合）
   * @returns 待機時間（ミリ秒）
   */
  getWaitTime: (error: unknown, attempt: number, previousResult?: T) => number;
};

/**
 * リトライ戦略のデフォルト実装
 */
export const defaultRetryStrategy: RetryStrategy<unknown> = {
  maxRetries: 3,
  shouldRetry: () => true,
  getWaitTime: () => 3000,
};

/**
 * コールバックをリトライ付きで実行
 *
 * @param callback 実行するコールバック関数（前回の結果を受け取れる）
 * @param retryStrategy リトライ戦略（オプション、指定されない場合はdefaultRetryStrategyを使用）
 * @returns コールバックの実行結果
 * @throws リトライ上限に達した場合、またはリトライしないと判定された場合のエラー
 */
export async function executeWithRetry<T>(
  callback: CallbackWithResult<T>,
  retryStrategy: RetryStrategy<T> = defaultRetryStrategy as RetryStrategy<T>,
): Promise<T> {
  let previousResult: T | undefined;
  let lastError: unknown;
  const maxRetries = retryStrategy.maxRetries;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await callback(previousResult);
      return result;
    } catch (error) {
      lastError = error;

      // リトライ上限に達した場合
      if (attempt > maxRetries) {
        throw error;
      }

      // リトライするかどうかを判定
      if (!retryStrategy.shouldRetry(error, attempt, previousResult)) {
        throw error;
      }

      // 待機時間を取得して待機
      const waitTime = retryStrategy.getWaitTime(
        error,
        attempt,
        previousResult,
      );
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // ここには到達しないはずだが、型安全性のため
  throw lastError;
}

/**
 * コールバックを指定回数繰り返し実行（各実行にリトライ機能付き）
 * 前回の実行結果を次のコールバックに渡します。
 *
 * @param callback 実行するコールバック関数（前回の結果を受け取り、新しい結果を返す）
 * @param times 実行回数（1以上である必要がある）
 * @param retryStrategy リトライ戦略（オプション、指定されない場合はdefaultRetryStrategyを使用）
 * @returns 最後の実行結果
 * @throws timesが0以下の場合にエラーをthrow
 */
export async function executeRepeatedCallback<
  T extends object & { isFinished?: boolean },
>(
  callback: CallbackWithResult<T>,
  times: number,
  retryStrategy?: RetryStrategy<T>,
): Promise<T> {
  if (times <= 0) {
    throw new Error(`times must be greater than 0, but got ${times}`);
  }

  // デフォルトのリトライ戦略
  const strategy: RetryStrategy<T> =
    retryStrategy ?? (defaultRetryStrategy as RetryStrategy<T>);

  let previousResult: T | undefined;

  for (let i = 0; i < times; i++) {
    const currentPreviousResult = previousResult;
    previousResult = await executeWithRetry(async (_prev) => {
      // 前回の実行結果を次のコールバックに渡す
      // executeWithRetry内のprevは使わず、executeRepeatedCallbackのpreviousResultを使用
      return await callback(currentPreviousResult);
    }, strategy);

    if (previousResult?.isFinished) {
      break;
    }
  }

  // 最後の実行結果を返す
  return previousResult!;
}

/**
 * 使用例:
 *
 * // 1. 基本的な使用（前回の結果を次のコールバックに渡す）
 * const result = await executeWithRetry(
 *     async (previousResult) => {
 *         // 前回の結果を使って処理
 *         const data = previousResult ? previousResult + 1 : 0;
 *         return data;
 *     },
 * );
 *
 * // 2. エラーの種類によってリトライを制御
 * const result = await executeWithRetry(
 *     async (previousResult) => {
 *         // 何らかの処理
 *         return { success: true };
 *     },
 *     {
 *         maxRetries: 5,
 *         shouldRetry: (error, attempt, previousResult) => {
 *             // 400エラーはリトライしない
 *             if (error instanceof Error && error.message.includes('400')) {
 *                 return false;
 *             }
 *             // 429エラー（レート制限）はリトライ
 *             if (error instanceof Error && error.message.includes('429')) {
 *                 return true;
 *             }
 *             // その他のエラーは最大3回までリトライ
 *             return attempt <= 3;
 *         },
 *         getWaitTime: (error, attempt, previousResult) => {
 *             // レート制限エラーの場合は長めに待機
 *             if (error instanceof Error && error.message.includes('429')) {
 *                 return 5000 * attempt; // 指数バックオフ
 *             }
 *             // その他のエラーは固定時間
 *             return 1000;
 *         },
 *     }
 * );
 *
 * // 3. 前回の結果に基づいて処理を変更
 * const result = await executeWithRetry(
 *     async (previousResult) => {
 *         if (previousResult) {
 *             // 前回の結果を使って再試行
 *             return await retryWithPreviousData(previousResult);
 *         } else {
 *             // 初回実行
 *             return await initialCall();
 *         }
 *     },
 *     {
 *         maxRetries: 3,
 *         shouldRetry: (error, attempt, previousResult) => {
 *             // 前回の結果がある場合はリトライしない
 *             if (previousResult) {
 *                 return false;
 *             }
 *             return attempt <= 3;
 *         },
 *         getWaitTime: (error, attempt) => attempt * 1000,
 *     }
 * );
 */
