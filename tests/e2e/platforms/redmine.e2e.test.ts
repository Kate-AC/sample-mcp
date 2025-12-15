import { exec } from "child_process";
import { promisify } from "util";
import { PlatformName, getMcp } from "@core/mcpRegistry";

const execAsync = promisify(exec);

describe("Redmine Platform E2E Tests", () => {
  const platformName: PlatformName = "redmine";
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
  });
});
