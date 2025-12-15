import { makeRedashMcp } from "@platforms/redash/adapter/redashMcp";

describe("redashMcp", () => {
  it("MCPオブジェクトを正しく作成できること", () => {
    const mcp = makeRedashMcp({});
    expect(mcp).toBeDefined();
    expect(mcp.mcpFunctions.getQueries).toBeDefined();
  });
});
