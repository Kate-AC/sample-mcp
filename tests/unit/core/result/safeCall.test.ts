import { ApiResponse } from "@core/contracts/application/apiClientPort";
import { ErrorType, Result } from "@core/result/result";
import { safeCall } from "@core/result/safeCall";

describe("safeCall", () => {
  describe("正常系", () => {
    it("成功したfetcherのレスポンスをそのまま返す", async () => {
      const fetcher = async (): Promise<ApiResponse<string>> => ({
        data: "test data",
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      const result = await safeCall(fetcher);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBe("test data");
    });

    it("responseConverterが指定された場合、変換後のレスポンスを返す", async () => {
      const fetcher = async (): Promise<ApiResponse<number>> => ({
        data: 100,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      const converter = (response: Result<number>): Result<number> => ({
        ...response,
        payload: response.payload * 2,
      });

      const result = await safeCall(fetcher, converter);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBe(200);
    });

    it("fetcherが失敗を返した場合でもそのまま返す", async () => {
      const fetcher = async (): Promise<ApiResponse<string>> => ({
        data: null as any,
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {} as any,
      });

      const result = await safeCall(fetcher);

      expect(result.isSuccess).toBe(false);
      expect(result.payload).toBeNull();
      expect(result.message).toBe("Not Found");
    });
  });

  describe("異常系", () => {
    it("fetcherが例外をthrowした場合、エラーResultを返す", async () => {
      const fetcher = async (): Promise<ApiResponse<string>> => {
        throw new Error("ネットワークエラー");
      };

      const result = await safeCall(fetcher);

      expect(result.isSuccess).toBe(false);
      expect(result.payload).toBeNull();
      expect(result.message).toBe("ネットワークエラー");
      expect(result.errorType).toBe(ErrorType.OTHER_ERROR);
    });

    it("Error以外の例外がthrowされた場合、文字列に変換してエラーResultを返す", async () => {
      const fetcher = async (): Promise<ApiResponse<string>> => {
        throw "string error";
      };

      const result = await safeCall(fetcher);

      expect(result.isSuccess).toBe(false);
      expect(result.payload).toBeNull();
      expect(result.message).toBe("string error");
      expect(result.errorType).toBe(ErrorType.OTHER_ERROR);
    });

    it("オブジェクトが例外としてthrowされた場合、文字列に変換してエラーResultを返す", async () => {
      const fetcher = async (): Promise<ApiResponse<string>> => {
        throw { code: 500, message: "Internal Server Error" };
      };

      const result = await safeCall(fetcher);

      expect(result.isSuccess).toBe(false);
      expect(result.payload).toBeNull();
      expect(result.message).toBe("[object Object]");
      expect(result.errorType).toBe(ErrorType.OTHER_ERROR);
    });

    it("responseConverterが例外をthrowした場合、エラーResultを返す", async () => {
      const fetcher = async (): Promise<ApiResponse<number>> => ({
        data: 100,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      const converter = (_response: Result<number>): Result<number> => {
        throw new Error("変換エラー");
      };

      const result = await safeCall(fetcher, converter);

      expect(result.isSuccess).toBe(false);
      expect(result.payload).toBeNull();
      expect(result.message).toBe("変換エラー");
      expect(result.errorType).toBe(ErrorType.OTHER_ERROR);
    });
  });

  describe("エッジケース", () => {
    it("payloadがundefinedの場合でも処理できる", async () => {
      const fetcher = async (): Promise<ApiResponse<undefined>> => ({
        data: undefined,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      const result = await safeCall(fetcher);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBeUndefined();
    });

    it("payloadがnullの場合でも処理できる", async () => {
      const fetcher = async (): Promise<ApiResponse<null>> => ({
        data: null,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      const result = await safeCall(fetcher);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBeNull();
    });

    it("複雑なオブジェクトをpayloadとして扱える", async () => {
      const complexObject = {
        id: 1,
        name: "test",
        nested: {
          value: "nested value",
        },
      };

      const fetcher = async (): Promise<ApiResponse<typeof complexObject>> => ({
        data: complexObject,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      const result = await safeCall(fetcher);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toEqual(complexObject);
    });
  });
});
