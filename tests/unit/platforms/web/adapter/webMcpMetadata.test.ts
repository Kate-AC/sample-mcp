import { makeWebMcpMetadata } from "@platforms/web/adapter/webMcpMetadata";

describe("webMcpMetadata", () => {
  it("メタデータが正しく取得できること", () => {
    const metadata = makeWebMcpMetadata();

    expect(metadata.getSummary().length).toBeGreaterThan(0);
    expect(metadata.getUsageContext().length).toBeGreaterThan(0);
    expect(metadata.getCommands().length).toBeGreaterThan(0);
    expect(metadata.getSecurityRules()).toBeDefined();
  });

  it("コマンドにfetchImageが含まれること", () => {
    const metadata = makeWebMcpMetadata();
    const commands = metadata.getCommands();

    expect(commands.some((cmd) => cmd.command.includes("fetchImage"))).toBe(
      true,
    );
  });
});
