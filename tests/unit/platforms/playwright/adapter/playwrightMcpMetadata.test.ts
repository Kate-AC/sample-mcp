import { makePlaywrightMcpMetadata } from "@platforms/playwright/adapter/playwrightMcpMetadata";

describe("playwrightMcpMetadata", () => {
  it("メタデータオブジェクトを正しく作成できること", () => {
    const metadata = makePlaywrightMcpMetadata();
    expect(metadata).toBeDefined();
  });

  it("サマリーが取得できること", () => {
    const metadata = makePlaywrightMcpMetadata();
    const summary = metadata.getSummary();
    expect(summary.length).toBeGreaterThan(0);
    expect(summary[0]).toContain("Playwright");
  });

  it("利用コンテキストが取得できること", () => {
    const metadata = makePlaywrightMcpMetadata();
    const context = metadata.getUsageContext();
    expect(context.length).toBeGreaterThan(0);
  });

  it("コマンド一覧が取得できること", () => {
    const metadata = makePlaywrightMcpMetadata();
    const commands = metadata.getCommands();
    expect(commands.length).toBeGreaterThan(0);

    const commandNames = commands.map((c) => c.command);
    expect(commandNames).toContain("navigate <url>");
    expect(commandNames).toContain("click <selector>");
    expect(commandNames).toContain("type <selector> <text>");
    expect(commandNames).toContain("screenshot [path]");
    expect(commandNames).toContain("evaluate <script>");
  });

  it("セキュリティルールが取得できること", () => {
    const metadata = makePlaywrightMcpMetadata();
    const rules = metadata.getSecurityRules();
    expect(rules.length).toBeGreaterThan(0);
  });
});
