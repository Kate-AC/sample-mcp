import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeRedmineMcpMetadata = (): McpMetadata => ({
  getSummary: () => ["Redmine（課題・チケット管理）にアクセス"],
  getUsageContext: () => [
    "チケットの詳細を確認する場合",
    "案件の全容を確認する場合",
    "お問い合わせの内容を確認する場合",
    "過去のオペレーションの対応内容を確認する場合",
  ],
  getCommands: () => [
    {
      description:
        "チケット一覧を取得。検索機能も含む。queryParamsでsubject、descriptionなどの条件を指定して検索可能。searchIssuesという別のツールは存在しないので、検索する場合はこのgetIssuesを使用すること。",
      command: "getIssues [queryParams]",
      usage: `npm run cli redmine:getIssues '{"subject":"~在庫減算","description":"~在庫減算","limit":"5"}'`,
    },
    {
      description: "特定のチケットを取得（親・子チケット、関連、コメント含む）",
      command: "getIssue <issueId> [queryParams]",
      usage: "npm run cli redmine:getIssue 57442",
    },
  ],
  getSecurityRules: () => [],
});
