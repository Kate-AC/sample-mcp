import { makeRedmineMcp } from "@platforms/redmine/adapter/redmineMcp";

describe("redmineMcp", () => {
  it("MCPオブジェクトを正しく作成できること", () => {
    const mcp = makeRedmineMcp();
    expect(mcp).toBeDefined();
  });
});
