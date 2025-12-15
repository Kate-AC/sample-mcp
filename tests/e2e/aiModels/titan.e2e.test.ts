import { exec } from "child_process";
import { promisify } from "util";
import { AiModelName, useAiModel } from "@core/aiModelRegistry";

const execAsync = promisify(exec);

describe("Titan AI Model E2E Tests", () => {
  const modelName: AiModelName = "titan";
  let aiModel: ReturnType<typeof useAiModel>;

  beforeAll(() => {
    aiModel = useAiModel(modelName);
  });

  it("aiModelが正しく取得できること", () => {
    expect(aiModel).toBeDefined();
    expect(aiModel.aiModelMetadata).toBeDefined();
  });

  describe("コマンド実行テスト", () => {
    const functions = useAiModel(modelName).aiModelMetadata.getFunctions();

    functions.forEach((func) => {
      describe(`${func.functionName}`, () => {
        it(`${func.functionName} - isSuccessがtrueであること`, async () => {
          // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
          if (process.env["RUN_E2E_TESTS"] !== "true") {
            console.warn(
              `⚠️  ${modelName}:${func.functionName} - E2Eテストはスキップされました（RUN_E2E_TESTS=true で有効化）`,
            );
            return;
          }

          // usageのコマンドをそのまま実行
          const { stdout } = await execAsync(func.usage, {
            env: { ...process.env, JSON_OUTPUT: "true" },
            maxBuffer: 100 * 1024 * 1024, // 100MB
          });

          // 最後の行（JSON出力）を取得してパース
          const lines = stdout.trim().split("\n");
          const jsonLine = lines[lines.length - 1];
          if (!jsonLine) {
            throw new Error("JSON出力が取得できませんでした");
          }
          const response = JSON.parse(jsonLine);

          // isSuccessの検証
          expect(response.isSuccess).toBe(true);

          // payloadが存在することを確認
          if (response.isSuccess && response.payload) {
            expect(response.payload).toBeDefined();
            expect(response.payload.content).toBeDefined();
          }
        }, 60000); // タイムアウト60秒（AI応答は時間がかかる）
      });
    });
  });

  describe("ask関数のテスト", () => {
    it("ask関数が応答を返すこと", async () => {
      // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
      if (process.env["RUN_E2E_TESTS"] !== "true") {
        console.warn(
          "⚠️  titan:ask 直接テスト - E2Eテストはスキップされました（RUN_E2E_TESTS=true で有効化）",
        );
        return;
      }

      const messages = [
        {
          role: "user" as const,
          content: "Hello, respond with just 'Hi!'",
        },
      ];

      const result = await (aiModel.aiModelFunctions as any).ask(messages);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload.text).toBeDefined();
      expect(typeof result.payload.text).toBe("string");
    }, 60000);

    it("ask関数で空配列を渡すとエラーになること", async () => {
      // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
      if (process.env["RUN_E2E_TESTS"] !== "true") {
        console.warn(
          "⚠️  titan:ask 空配列テスト - E2Eテストはスキップされました（RUN_E2E_TESTS=true で有効化）",
        );
        return;
      }

      const result = await (aiModel.aiModelFunctions as any).ask([]);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Messages array cannot be empty");
    });

    it("ask関数で最後のユーザーメッセージのみを使用すること", async () => {
      // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
      if (process.env["RUN_E2E_TESTS"] !== "true") {
        console.warn(
          "⚠️  titan:ask 最後のメッセージテスト - E2Eテストはスキップされました（RUN_E2E_TESTS=true で有効化）",
        );
        return;
      }

      const messages = [
        {
          role: "user" as const,
          content: "My name is Alice.",
        },
        {
          role: "assistant" as const,
          content: "Nice to meet you!",
        },
        {
          role: "user" as const,
          content: "Say 'Testing last message'",
        },
      ];

      const result = await (aiModel.aiModelFunctions as any).ask(messages);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload.text).toBeDefined();
      // Titanは会話履歴を保持しないため、最後のメッセージに応答
    }, 60000);
  });

  describe("askJson関数のテスト", () => {
    it("askJson関数がJSON形式で応答を返すこと", async () => {
      // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
      if (process.env["RUN_E2E_TESTS"] !== "true") {
        console.warn(
          "⚠️  titan:askJson 直接テスト - E2Eテストはスキップされました（RUN_E2E_TESTS=true で有効化）",
        );
        return;
      }

      const messages = [
        {
          role: "user" as const,
          content: "What is 2+2? Answer briefly.",
        },
      ];

      const result = await (aiModel.aiModelFunctions as any).askJson(messages);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload.answer).toBeDefined();
      expect(typeof result.payload.answer).toBe("string");
      expect(Array.isArray(result.payload.additional_links)).toBe(true);
      expect(Array.isArray(result.payload.additional_commands)).toBe(true);
      expect(Array.isArray(result.payload.additional_infos)).toBe(true);
    }, 60000);

    it("askJson関数で空配列を渡すとエラーになること", async () => {
      // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
      if (process.env["RUN_E2E_TESTS"] !== "true") {
        console.warn(
          "⚠️  titan:askJson 空配列テスト - E2Eテストはスキップされました（RUN_E2E_TESTS=true で有効化）",
        );
        return;
      }

      const result = await (aiModel.aiModelFunctions as any).askJson([]);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Messages array cannot be empty");
    });

    it("askJson関数で最後のユーザーメッセージのみを使用すること", async () => {
      // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
      if (process.env["RUN_E2E_TESTS"] !== "true") {
        console.warn(
          "⚠️  titan:askJson 最後のメッセージテスト - E2Eテストはスキップされました（RUN_E2E_TESTS=true で有効化）",
        );
        return;
      }

      const messages = [
        {
          role: "user" as const,
          content: "Ignore this message.",
        },
        {
          role: "assistant" as const,
          content: "OK.",
        },
        {
          role: "user" as const,
          content: "What is the capital of France? Answer briefly.",
        },
      ];

      const result = await (aiModel.aiModelFunctions as any).askJson(messages);

      expect(result.isSuccess).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload.answer).toBeDefined();
      // Titanは会話履歴を保持しないため、最後のメッセージ（フランスの首都）に応答
      expect(result.payload.answer.toLowerCase()).toContain("paris");
    }, 60000);
  });
});
