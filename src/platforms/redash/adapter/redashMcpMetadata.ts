import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeRedashMcpMetadata = (): McpMetadata => ({
  getSummary: () => ["Redash（SQL/BigQuery/Athena）にアクセス"],
  getUsageContext: () => [
    "クエリの実行結果を確認する場合",
    "MySQLの内容を確認する場合",
    "BigQueryの内容を確認する場合",
    "Athenaの内容を確認する場合",
  ],
  getCommands: () => [
    {
      description: "クエリ一覧を取得",
      command: "getQueries [queryParams]",
      usage: "npm run cli redash:getQueries",
    },
    {
      description: "特定のクエリを取得",
      command: "getQuery <queryId> [queryParams]",
      usage: "npm run cli redash:getQuery 6852",
    },
    {
      description: "データソース一覧を取得",
      command: "getDataSources [queryParams]",
      usage: "npm run cli redash:getDataSources",
    },
    {
      description: "アラート一覧を取得",
      command: "getAlerts [queryParams]",
      usage: "npm run cli redash:getAlerts",
    },
    {
      description: "任意のSQLを実行（環境名: prod, stage, local）",
      command: "executeSql <env> <sql>",
      usage:
        'npm run cli redash:executeSql stage "SELECT * FROM companys LIMIT 5"',
    },
  ],
  getSecurityRules: () => [
    "絶対禁止: 更新・削除のクエリを発行する行為",
    "絶対禁止: LIMIT無しでクエリを発行する行為",
  ],
});
