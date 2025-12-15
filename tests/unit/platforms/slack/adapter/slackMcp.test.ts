import { makeSlackMcp } from "@platforms/slack/adapter/slackMcp";

describe("slackMcp", () => {
  it("MCPオブジェクトを正しく作成できること", () => {
    const mcp = makeSlackMcp();
    expect(mcp).toBeDefined();
  });
});
