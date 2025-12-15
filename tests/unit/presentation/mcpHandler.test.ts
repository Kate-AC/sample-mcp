import { call, getEnv, getMcp, getMetadata } from "@presentation/mcpHandler";

describe("mcpHandler", () => {
  it("mcpHandlerモジュールが正しくロードできること", () => {
    expect(call).toBeDefined();
    expect(getMcp).toBeDefined();
    expect(getMetadata).toBeDefined();
    expect(getEnv).toBeDefined();
  });
});
