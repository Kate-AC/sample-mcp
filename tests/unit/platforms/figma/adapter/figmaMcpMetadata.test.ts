import { makeFigmaMcpMetadata } from "@platforms/figma/adapter/figmaMcpMetadata";

describe("figmaMcpMetadata", () => {
  it("メタデータが正しく取得できること", () => {
    const metadata = makeFigmaMcpMetadata();

    expect(metadata.getSummary().length).toBeGreaterThan(0);
    expect(metadata.getUsageContext().length).toBeGreaterThan(0);
    expect(metadata.getCommands().length).toBeGreaterThan(0);
    expect(metadata.getSecurityRules().length).toBeGreaterThan(0);
  });

  it("コマンドにgetImages, getComments, getFileが含まれること", () => {
    const metadata = makeFigmaMcpMetadata();
    const commands = metadata.getCommands();

    expect(commands.some((cmd) => cmd.command.includes("getImages"))).toBe(
      true,
    );
    expect(commands.some((cmd) => cmd.command.includes("getComments"))).toBe(
      true,
    );
    expect(commands.some((cmd) => cmd.command.includes("getFile"))).toBe(true);
  });
});
