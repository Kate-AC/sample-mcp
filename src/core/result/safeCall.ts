import { ApiResponse } from "@core/contracts/application/apiClientPort";
import { ErrorType, Result } from "./result";

/**
 * 非同期関数を安全に実行し、エラーをResult型で返す
 *
 * @param fetcher 非同期関数
 * @param responseConverter レスポンス変換関数
 * @returns Result<T>
 */
export const safeCall = async <T>(
  fetcher: () => Promise<ApiResponse<T>>,
  responseConverter?: (response: Result<T>) => Result<T>,
): Promise<Result<T>> => {
  try {
    const apiResponse = await fetcher();

    const result = {
      payload: apiResponse.data,
      status: apiResponse.status,
      isSuccess: apiResponse.status >= 200 && apiResponse.status < 300,
      message: apiResponse.statusText || "ok",
    };

    if (responseConverter) {
      return responseConverter(result);
    }

    return result;
  } catch (error) {
    return {
      // 例外ということは型指定の時点の想定と異なるのでnullに倒してTにキャスト
      payload: null as T,
      status: 500,
      isSuccess: false,
      message: error instanceof Error ? error.message : String(error),
      errorType: ErrorType.OTHER_ERROR,
    };
  }
};
