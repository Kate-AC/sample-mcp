import { makeRedmineMcpMetadata } from "@platforms/redmine/adapter/redmineMcpMetadata";

describe("redmineMcpMetadata", () => {
  it("メタデータオブジェクトを正しく作成できること", () => {
    const metadata = makeRedmineMcpMetadata();
    expect(metadata).toBeDefined();
  });
});
