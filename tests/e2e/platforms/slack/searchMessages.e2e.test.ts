import { execSync } from "child_process";

const runE2E = process.env["RUN_E2E_TESTS"] === "true";

const itOrSkip = runE2E ? it : it.skip;

describe("Slack searchMessages (e2e)", () => {
  itOrSkip("CLIで検索できる（JSON_OUTPUT=true）", () => {
    const env = {
      ...process.env,
      JSON_OUTPUT: "true",
    } as NodeJS.ProcessEnv;

    const cmd =
      "ts-node -r tsconfig-paths/register src/presentation/cli/main.ts slack:searchMessages 'copilot ライセンス' 'count=1'";

    const stdout = execSync(cmd, {
      cwd: process.cwd(),
      env,
      stdio: "pipe",
    }).toString();

    const parsed = JSON.parse(stdout);
    expect(parsed.platform).toBe("slack");
    expect(parsed.funcName).toBe("searchMessages");
    expect(parsed.result).toBeDefined();
    expect(parsed.result.isSuccess).toBe(true);
    expect(parsed.result.payload.ok).toBe(true);
  });
});
