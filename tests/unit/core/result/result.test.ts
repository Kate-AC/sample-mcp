import { ErrorType, Result } from "@core/result/result";

describe("Result", () => {
  describe("ErrorType", () => {
    it("PARSE_ERRORが定義されている", () => {
      expect(ErrorType.PARSE_ERROR).toBe("parse_error");
    });

    it("OTHER_ERRORが定義されている", () => {
      expect(ErrorType.OTHER_ERROR).toBe("other_error");
    });
  });

  describe("Result型", () => {
    it("成功時のResultを作成できる", () => {
      const result: Result<string> = {
        payload: "test data",
        status: 200,
        isSuccess: true,
      };

      expect(result.payload).toBe("test data");
      expect(result.isSuccess).toBe(true);
      expect(result.message).toBeUndefined();
      expect(result.errorType).toBeUndefined();
    });

    it("失敗時のResultを作成できる", () => {
      const result: Result<string> = {
        payload: null as any,
        status: 500,
        isSuccess: false,
        message: "エラーが発生しました",
        errorType: ErrorType.OTHER_ERROR,
      };

      expect(result.payload).toBeNull();
      expect(result.isSuccess).toBe(false);
      expect(result.message).toBe("エラーが発生しました");
      expect(result.errorType).toBe(ErrorType.OTHER_ERROR);
    });

    it("PARSE_ERRORを持つResultを作成できる", () => {
      const result: Result<any> = {
        payload: null,
        status: 400,
        isSuccess: false,
        message: "パースエラー",
        errorType: ErrorType.PARSE_ERROR,
      };

      expect(result.errorType).toBe(ErrorType.PARSE_ERROR);
      expect(result.isSuccess).toBe(false);
    });

    it("messageとerrorTypeは省略可能", () => {
      const result: Result<number> = {
        payload: 123,
        status: 200,
        isSuccess: true,
      };

      expect(result.payload).toBe(123);
      expect(result.isSuccess).toBe(true);
    });
  });
});
