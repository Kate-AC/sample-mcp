import { makeSlackMcpMetadata } from "@platforms/slack/adapter/slackMcpMetadata";

describe("slackMcpMetadata", () => {
  it("メタデータオブジェクトを正しく作成できること", () => {
    const metadata = makeSlackMcpMetadata();
    expect(metadata).toBeDefined();
  });
});
