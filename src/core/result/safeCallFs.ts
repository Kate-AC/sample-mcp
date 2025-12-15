import { ErrorType, ResultFs } from "./result";

/**
 * 非同期関数を安全に実行し、エラーをResult型で返す
 *
 * @param fetcher 非同期関数
 * @param responseConverter レスポンス変換関数
 * @returns ResultFs<T>
 */
export const safeCallFs = async <T>(
  fetcher: () => Promise<T>,
): Promise<ResultFs<T>> => {
  try {
    const payload = await fetcher();

    return {
      payload,
      isSuccess: true,
      message: "ok",
    };
  } catch (error) {
    return {
      // 例外ということは型指定の時点の想定と異なるのでnullに倒してTにキャスト
      payload: null as T,
      isSuccess: false,
      message: error instanceof Error ? error.message : String(error),
      errorType: ErrorType.OTHER_ERROR,
    };
  }
};
