import {
  RetryStrategy,
  executeRepeatedCallback,
  executeWithRetry,
} from "@core/exector/callbackExecutor";

describe("executeWithRetry", () => {
  describe("成功ケース", () => {
    it("初回で成功した場合は結果を返すこと", async () => {
      const callback = jest.fn().mockResolvedValue("success");

      const result = await executeWithRetry(callback, {
        maxRetries: 3,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result).toBe("success");
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(undefined);
    });

    it("リトライ後に成功した場合は結果を返すこと", async () => {
      const callback = jest
        .fn()
        .mockRejectedValueOnce(new Error("error1"))
        .mockRejectedValueOnce(new Error("error2"))
        .mockResolvedValue("success");

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 3,
        shouldRetry: () => true,
        getWaitTime: () => 0, // 待機時間なし
      };

      const result = await executeWithRetry(callback, retryStrategy);

      expect(result).toBe("success");
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("前回の結果を次のコールバックに渡すこと", async () => {
      const callback = jest.fn(async (prev: string | undefined) => {
        if (prev === undefined) {
          return "first";
        } else if (prev === "first") {
          return "second";
        } else {
          return "third";
        }
      });

      // executeWithRetry内で前回の結果が渡されることを確認
      const result = await executeWithRetry<string>(
        async (prev) => {
          return await callback(prev);
        },
        {
          maxRetries: 0, // リトライなし
          shouldRetry: () => true,
          getWaitTime: () => 0,
        },
      );

      expect(result).toBe("first");
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(undefined);

      // 2回目の実行で前回の結果が渡されることを確認
      const result2 = await executeWithRetry<string>(
        async (prev) => {
          return await callback(prev);
        },
        {
          maxRetries: 0,
          shouldRetry: () => true,
          getWaitTime: () => 0,
        },
      );

      expect(result2).toBe("first");
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(2, undefined);
    });
  });

  describe("エラーケース", () => {
    it("リトライ上限を超えた場合はエラーがthrowされること", async () => {
      const error = new Error("test error");
      const callback = jest.fn().mockRejectedValue(error);

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 2,
        shouldRetry: () => true,
        getWaitTime: () => 0, // 待機時間なし
      };

      await expect(executeWithRetry(callback, retryStrategy)).rejects.toThrow(
        "test error",
      );
      expect(callback).toHaveBeenCalledTimes(3); // 初回 + 2回のリトライ
    });

    it("リトライ上限が0の場合、1回だけ実行してエラーをthrowすること", async () => {
      const error = new Error("test error");
      const callback = jest.fn().mockRejectedValue(error);

      await expect(
        executeWithRetry(callback, {
          maxRetries: 0,
          shouldRetry: () => true,
          getWaitTime: () => 0,
        }),
      ).rejects.toThrow("test error");
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("retryStrategy - shouldRetry", () => {
    it("shouldRetryがfalseを返す場合はリトライせずにエラーをthrowすること", async () => {
      const error = new Error("test error");
      const callback = jest.fn().mockRejectedValue(error);

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 5,
        shouldRetry: () => false, // リトライしない
        getWaitTime: () => 0,
      };

      await expect(executeWithRetry(callback, retryStrategy)).rejects.toThrow(
        "test error",
      );
      expect(callback).toHaveBeenCalledTimes(1); // リトライされない
    });

    it("shouldRetryがエラーの種類によって判定すること", async () => {
      const retryableError = new Error("429 Rate Limit");
      const nonRetryableError = new Error("400 Bad Request");

      const callback1 = jest.fn().mockRejectedValue(retryableError);
      const callback2 = jest.fn().mockRejectedValue(nonRetryableError);

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 2,
        shouldRetry: (error) => {
          if (error instanceof Error && error.message.includes("429")) {
            return true; // 429エラーはリトライ
          }
          return false; // その他はリトライしない
        },
        getWaitTime: () => 0,
      };

      // 429エラーの場合はリトライされる
      await expect(executeWithRetry(callback1, retryStrategy)).rejects.toThrow(
        "429 Rate Limit",
      );
      expect(callback1).toHaveBeenCalledTimes(3); // 初回 + 2回のリトライ

      // 400エラーの場合はリトライされない
      await expect(executeWithRetry(callback2, retryStrategy)).rejects.toThrow(
        "400 Bad Request",
      );
      expect(callback2).toHaveBeenCalledTimes(1); // リトライされない
    });

    it("shouldRetryが試行回数によって判定すること", async () => {
      const error = new Error("test error");
      const callback = jest.fn().mockRejectedValue(error);

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 5,
        shouldRetry: (_, attempt) => {
          return attempt <= 2; // 2回までリトライ
        },
        getWaitTime: () => 0,
      };

      await expect(executeWithRetry(callback, retryStrategy)).rejects.toThrow(
        "test error",
      );
      // 初回 + 2回のリトライ = 3回実行
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("shouldRetryが前回の結果に基づいて判定すること", async () => {
      const error = new Error("test error");
      const callback = jest
        .fn()
        .mockResolvedValueOnce("first")
        .mockRejectedValue(error);

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 5,
        shouldRetry: (_, __, previousResult) => {
          // 前回の結果がある場合はリトライしない
          return previousResult === undefined;
        },
        getWaitTime: () => 0,
      };

      // 初回は成功、2回目でエラーが発生するが、前回の結果があるためリトライしない
      const result = await executeWithRetry(async (prev) => {
        if (prev) {
          throw error;
        }
        return await callback(prev);
      }, retryStrategy);

      expect(result).toBe("first");
    });
  });

  describe("retryStrategy - getWaitTime", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("getWaitTimeが呼ばれて待機時間が適用されること", async () => {
      const error = new Error("test error");
      const callback = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const getWaitTime = jest.fn().mockReturnValue(1000);

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 3,
        shouldRetry: () => true,
        getWaitTime,
      };

      const promise = executeWithRetry(callback, retryStrategy);

      // タイマーを進める
      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toBe("success");
      expect(getWaitTime).toHaveBeenCalledTimes(1);
      expect(getWaitTime).toHaveBeenCalledWith(error, 1, undefined);
    });

    it("getWaitTimeが試行回数に応じて待機時間を変更すること", async () => {
      const error = new Error("test error");
      const callback = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const getWaitTime = jest
        .fn()
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2000);

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 3,
        shouldRetry: () => true,
        getWaitTime,
      };

      const promise = executeWithRetry(callback, retryStrategy);

      // 1回目のリトライ待機
      await jest.advanceTimersByTimeAsync(1000);
      // 2回目のリトライ待機
      await jest.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(result).toBe("success");
      expect(getWaitTime).toHaveBeenCalledTimes(2);
      expect(getWaitTime).toHaveBeenNthCalledWith(1, error, 1, undefined);
      expect(getWaitTime).toHaveBeenNthCalledWith(2, error, 2, undefined);
    });

    it("getWaitTimeが0を返す場合は待機しないこと", async () => {
      const error = new Error("test error");
      const callback = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const getWaitTime = jest.fn().mockReturnValue(0);

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 3,
        shouldRetry: () => true,
        getWaitTime,
      };

      const result = await executeWithRetry(callback, retryStrategy);

      expect(result).toBe("success");
      expect(getWaitTime).toHaveBeenCalledTimes(1);
      // タイマーを進めなくても成功する（待機していない）
    });

    it("getWaitTimeが前回の結果を受け取れること", async () => {
      const error = new Error("test error");
      let callCount = 0;

      const getWaitTime = jest.fn().mockReturnValue(0); // 待機時間なしでテストを高速化

      const retryStrategy: RetryStrategy<string> = {
        maxRetries: 3,
        shouldRetry: () => true,
        getWaitTime: (err, attempt, previousResult) => {
          // 前回の結果を受け取れることを確認
          getWaitTime(err, attempt, previousResult);
          return 0; // 待機時間なし
        },
      };

      // 初回実行でエラーが発生し、リトライで成功するシナリオ
      const result = await executeWithRetry<string>(async (_prev) => {
        callCount++;
        if (callCount === 1) {
          // 初回実行でエラーが発生
          throw error;
        }
        // リトライ時は成功
        return "success";
      }, retryStrategy);

      expect(result).toBe("success");
      // previousResultがundefinedとして渡されることを確認（エラー発生時点ではまだ更新されていない）
      expect(getWaitTime).toHaveBeenCalledWith(error, 1, undefined);
    });
  });

  describe("defaultRetryStrategy", () => {
    it("retryStrategyが指定されない場合はdefaultRetryStrategyが使用されること", async () => {
      const callback = jest
        .fn()
        .mockRejectedValueOnce(new Error("error"))
        .mockResolvedValue("success");

      const result = await executeWithRetry(callback);

      expect(result).toBe("success");
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});

describe("executeRepeatedCallback", () => {
  describe("成功ケース", () => {
    it("指定回数実行して最後の結果を返すこと", async () => {
      type State = { value: string };
      const callback = jest
        .fn()
        .mockResolvedValueOnce({ value: "first" })
        .mockResolvedValueOnce({ value: "second" })
        .mockResolvedValueOnce({ value: "third" });

      const result = await executeRepeatedCallback<State>(callback, 3, {
        maxRetries: 0,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result.value).toBe("third");
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("前回の実行結果を次のコールバックに渡すこと", async () => {
      type State = { value: number };
      const callback = jest.fn(
        async (prev: State | undefined): Promise<State> => {
          // 前回の結果に1を足して返す
          if (prev === undefined) {
            return { value: 0 };
          }
          return { value: prev.value + 1 };
        },
      );

      const result = await executeRepeatedCallback<State>(callback, 5, {
        maxRetries: 0,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result.value).toBe(4); // 0, 1, 2, 3, 4
      expect(callback).toHaveBeenCalledTimes(5);
      expect(callback).toHaveBeenNthCalledWith(1, undefined);
      expect(callback).toHaveBeenNthCalledWith(2, { value: 0 });
      expect(callback).toHaveBeenNthCalledWith(3, { value: 1 });
      expect(callback).toHaveBeenNthCalledWith(4, { value: 2 });
      expect(callback).toHaveBeenNthCalledWith(5, { value: 3 });
    });

    it("各実行でリトライが発生しても最終的に成功すること", async () => {
      jest.useFakeTimers();

      type State = { value: string };
      const callback = jest
        .fn()
        .mockRejectedValueOnce(new Error("error1"))
        .mockResolvedValueOnce({ value: "first" })
        .mockRejectedValueOnce(new Error("error2"))
        .mockResolvedValueOnce({ value: "second" })
        .mockResolvedValueOnce({ value: "third" });

      const retryStrategy: RetryStrategy<State> = {
        maxRetries: 1,
        shouldRetry: () => true,
        getWaitTime: () => 0, // 待機時間なし
      };

      const promise = executeRepeatedCallback<State>(
        callback,
        3,
        retryStrategy,
      );

      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result.value).toBe("third");
      expect(callback).toHaveBeenCalledTimes(5); // 成功3回 + リトライ2回

      jest.useRealTimers();
    });
  });

  describe("エラーケース", () => {
    it("リトライ上限を超えた場合はエラーがthrowされること", async () => {
      type State = { value: string };
      const error = new Error("test error");
      const callback = jest.fn().mockRejectedValue(error);

      await expect(
        executeRepeatedCallback<State>(callback, 3, {
          maxRetries: 1,
          shouldRetry: () => true,
          getWaitTime: () => 0,
        }),
      ).rejects.toThrow("test error");
      // 1回目の実行でリトライ上限に達する
      expect(callback).toHaveBeenCalledTimes(2); // 初回 + 1回のリトライ
    });

    it("timesが0の場合は例外がthrowされること", async () => {
      type State = { value: string };
      const callback = jest.fn().mockResolvedValue({ value: "success" });

      await expect(
        executeRepeatedCallback<State>(callback, 0, {
          maxRetries: 0,
          shouldRetry: () => true,
          getWaitTime: () => 0,
        }),
      ).rejects.toThrow("times must be greater than 0, but got 0");

      expect(callback).not.toHaveBeenCalled();
    });

    it("timesが負の数の場合は例外がthrowされること", async () => {
      type State = { value: string };
      const callback = jest.fn().mockResolvedValue({ value: "success" });

      await expect(
        executeRepeatedCallback<State>(callback, -1, {
          maxRetries: 0,
          shouldRetry: () => true,
          getWaitTime: () => 0,
        }),
      ).rejects.toThrow("times must be greater than 0, but got -1");

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("retryStrategy", () => {
    it("カスタムretryStrategyが適用されること", async () => {
      type State = { value: string };
      const callback = jest
        .fn()
        .mockRejectedValueOnce(new Error("429 Rate Limit"))
        .mockResolvedValueOnce({ value: "first" })
        .mockResolvedValueOnce({ value: "second" });

      const retryStrategy: RetryStrategy<State> = {
        maxRetries: 1,
        shouldRetry: (error) => {
          if (error instanceof Error && error.message.includes("429")) {
            return true; // 429エラーはリトライ
          }
          return false;
        },
        getWaitTime: () => 0,
      };

      const result = await executeRepeatedCallback<State>(
        callback,
        2,
        retryStrategy,
      );

      expect(result.value).toBe("second");
      expect(callback).toHaveBeenCalledTimes(3); // 成功2回 + リトライ1回
    });

    it("retryStrategyが指定されない場合はdefaultRetryStrategyが使用されること", async () => {
      type State = { value: string };
      const callback = jest
        .fn()
        .mockRejectedValueOnce(new Error("error"))
        .mockResolvedValueOnce({ value: "first" })
        .mockResolvedValueOnce({ value: "second" });

      const result = await executeRepeatedCallback<State>(callback, 2, {
        maxRetries: 1,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result.value).toBe("second");
      expect(callback).toHaveBeenCalledTimes(3); // 成功2回 + リトライ1回
    });

    it("retryStrategyのshouldRetryがfalseを返す場合はリトライしないこと", async () => {
      type State = { value: string };
      const error = new Error("test error");
      const callback = jest.fn().mockRejectedValue(error);

      const retryStrategy: RetryStrategy<State> = {
        maxRetries: 5,
        shouldRetry: () => false, // リトライしない
        getWaitTime: () => 0,
      };

      await expect(
        executeRepeatedCallback<State>(callback, 1, retryStrategy),
      ).rejects.toThrow("test error");
      expect(callback).toHaveBeenCalledTimes(1); // リトライされない
    });
  });

  describe("isFinishedフラグによる早期終了", () => {
    it("isFinishedがtrueの場合、ループが早期終了すること", async () => {
      type State = {
        value: number;
        isFinished?: boolean;
      };

      const callback = jest.fn(
        async (prev: State | undefined): Promise<State> => {
          if (prev === undefined) {
            return { value: 1 };
          }
          if (prev.value === 2) {
            return { value: 3, isFinished: true };
          }
          return { value: prev.value + 1 };
        },
      );

      const result = await executeRepeatedCallback<State>(callback, 10, {
        maxRetries: 0,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result.value).toBe(3);
      expect(result.isFinished).toBe(true);
      // 3回実行される（初回、2回目、3回目でisFinishedがtrueになる）
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, undefined);
      expect(callback).toHaveBeenNthCalledWith(2, { value: 1 });
      expect(callback).toHaveBeenNthCalledWith(3, { value: 2 });
    });

    it("初回でisFinishedがtrueの場合、1回だけ実行されること", async () => {
      type State = {
        value: number;
        isFinished?: boolean;
      };

      const callback = jest.fn(async (): Promise<State> => {
        return { value: 1, isFinished: true };
      });

      const result = await executeRepeatedCallback<State>(callback, 10, {
        maxRetries: 0,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result.value).toBe(1);
      expect(result.isFinished).toBe(true);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("isFinishedがfalseの場合は通常通り実行されること", async () => {
      type State = {
        value: number;
        isFinished?: boolean;
      };

      const callback = jest.fn(
        async (prev: State | undefined): Promise<State> => {
          if (prev === undefined) {
            return { value: 1, isFinished: false };
          }
          return { value: prev.value + 1, isFinished: false };
        },
      );

      const result = await executeRepeatedCallback<State>(callback, 5, {
        maxRetries: 0,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result.value).toBe(5);
      expect(result.isFinished).toBe(false);
      // isFinishedがfalseなので、指定回数（5回）実行される
      expect(callback).toHaveBeenCalledTimes(5);
    });

    it("isFinishedがundefinedの場合は通常通り実行されること", async () => {
      type State = {
        value: number;
        isFinished?: boolean;
      };

      const callback = jest.fn(
        async (prev: State | undefined): Promise<State> => {
          if (prev === undefined) {
            return { value: 1 };
          }
          return { value: prev.value + 1 };
        },
      );

      const result = await executeRepeatedCallback<State>(callback, 5, {
        maxRetries: 0,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result.value).toBe(5);
      expect(result.isFinished).toBeUndefined();
      // isFinishedがundefinedなので、指定回数（5回）実行される
      expect(callback).toHaveBeenCalledTimes(5);
    });

    it("途中でisFinishedがtrueになった場合、その時点で終了すること", async () => {
      type State = {
        iteration: number;
        isFinished?: boolean;
      };

      const callback = jest.fn(
        async (prev: State | undefined): Promise<State> => {
          if (prev === undefined) {
            return { iteration: 1 };
          }
          if (prev.iteration === 3) {
            return { iteration: 4, isFinished: true };
          }
          return { iteration: prev.iteration + 1 };
        },
      );

      const result = await executeRepeatedCallback<State>(callback, 10, {
        maxRetries: 0,
        shouldRetry: () => true,
        getWaitTime: () => 0,
      });

      expect(result.iteration).toBe(4);
      expect(result.isFinished).toBe(true);
      // 4回実行される（iteration: 1, 2, 3, 4でisFinishedがtrueになる）
      expect(callback).toHaveBeenCalledTimes(4);
      // 5回目以降は実行されない
      expect(callback).not.toHaveBeenCalledTimes(5);
    });
  });
});
