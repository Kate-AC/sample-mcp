import { makeRedashMcpMetadata } from "@platforms/redash/adapter/redashMcpMetadata";

describe("redashMcpMetadata", () => {
  it("メタデータオブジェクトを正しく作成できること", () => {
    const metadata = makeRedashMcpMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.getSummary()).toEqual([
      "Redash（SQL/BigQuery/Athena）にアクセス",
    ]);
  });
});
