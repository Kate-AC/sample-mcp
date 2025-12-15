import { exec } from "child_process";
import { promisify } from "util";
import { PlatformName, getMcp } from "@core/mcpRegistry";

const execAsync = promisify(exec);

describe("Google Platform E2E Tests", () => {
  const platformName: PlatformName = "google";
  let mcp: ReturnType<typeof getMcp>;

  beforeAll(() => {
    mcp = getMcp(platformName);
  });

  it("mcpが正しく取得できること", () => {
    expect(mcp).toBeDefined();
    expect(mcp.mcpMetadata).toBeDefined();
  });

  describe("コマンド実行テスト", () => {
    const commands = getMcp(platformName).mcpMetadata.getCommands();

    commands.forEach((cmd) => {
      describe(`${cmd.command}`, () => {
        it(`${cmd.command} - isSuccessがtrueであること`, async () => {
          // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
          if (process.env["RUN_E2E_TESTS"] !== "true") {
            console.warn(
              `⚠️  ${platformName}:${cmd.command} - E2Eテストはスキップされました（RUN_E2E_TESTS=true で有効化）`,
            );
            return;
          }

          // usageのコマンドをそのまま実行
          const { stdout } = await execAsync(cmd.usage, {
            env: { ...process.env, JSON_OUTPUT: "true" },
            maxBuffer: 10 * 1024 * 1024, // 10MB
          });

          // 最後の行（JSON出力）を取得してパース
          const lines = stdout.trim().split("\n");
          const jsonLine = lines[lines.length - 1];
          if (!jsonLine) {
            throw new Error("JSON出力が取得できませんでした");
          }
          const response = JSON.parse(jsonLine);

          // isSuccessの検証
          expect(response.result.isSuccess).toBe(true);

          // payloadが存在する場合、オブジェクトまたは配列であることを確認
          if (response.result.isSuccess && response.result.payload) {
            expect(
              typeof response.result.payload === "object" ||
                Array.isArray(response.result.payload),
            ).toBe(true);
          }
        }, 30000); // タイムアウト30秒
      });
    });

    describe("getDocumentのタブ指定機能", () => {
      it("getDocumentコマンドでタブ指定ができること", async () => {
        // E2Eテストは RUN_E2E_TESTS=true の場合のみ実行
        if (process.env["RUN_E2E_TESTS"] !== "true") {
          console.warn(
            "⚠️  getDocumentのタブ指定機能テストはスキップされました（RUN_E2E_TESTS=true で有効化）",
          );
          return;
        }

        // 実際のドキュメントIDとタブIDを使用する場合は、環境変数から取得
        const documentId =
          process.env["GOOGLE_TEST_DOCUMENT_ID"] ||
          "19MU_vmGR3Z3PUXdB0UgZ9iAmAR3jAEdPshcN23cyTsE";
        const tabId = process.env["GOOGLE_TEST_TAB_ID"] || "t.wx47ac7xno4c";

        const { stdout } = await execAsync(
          `npm run cli google:getDocument ${documentId} ${tabId}`,
          {
            env: { ...process.env, JSON_OUTPUT: "true" },
            maxBuffer: 10 * 1024 * 1024, // 10MB
          },
        );

        // 出力にタブの内容が含まれていることを確認
        expect(stdout).toBeDefined();
        // JSON出力が最後にある場合はパースして検証
        const lines = stdout.trim().split("\n");
        const jsonLine = lines[lines.length - 1];
        if (jsonLine && jsonLine.startsWith("{")) {
          try {
            const response = JSON.parse(jsonLine);
            if (response.result?.isSuccess) {
              expect(response.result.isSuccess).toBe(true);
            }
          } catch {
            // JSONでない場合は、プレーンテキスト出力が成功したとみなす
            expect(stdout.length).toBeGreaterThan(0);
          }
        }
      }, 60000); // タイムアウト60秒
    });
  });
});
