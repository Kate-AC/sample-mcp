import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeDatadogMcpMetadata = (): McpMetadata => ({
  getSummary: () => ["Datadogログを検索して取得"],
  getUsageContext: () => [
    "Datadogのログを取得したい場合",
    "エラーログの調査に使用",
  ],
  getCommands: () => [
    {
      description: "ログを検索",
      command: "searchLogs <query> [limit]",
      usage: 'npm run cli datadog:searchLogs "service:order-sync" 5',
    },
    {
      description:
        "Datadogログ分析の完全なURLからログを取得（完全なURLを渡すこと）",
      command: "searchLogsFromUrl <url>",
      usage:
        'npm run cli datadog:searchLogsFromUrl "https://app.datadoghq.com/logs?query=service:order-sync"',
    },
    {
      description: "APMトレースのメタデータを取得（spanIdから）",
      command: "getTraceMetadataBySpanId <spanId>",
      usage:
        'npm run cli datadog:getTraceMetadataBySpanId "5029612828202487486"',
    },
    {
      description: "company_codeと開始終了時刻でログを検索(Y-m-d H:i:s形式)",
      command:
        "searchLogsByCompanyCode <companyCode> <fromDateTime> <toDateTime>",
      usage:
        'npm run cli datadog:searchLogsByCompanyCode "OL001" "2026-01-01 00:00:00" "2026-01-01 00:05:00"',
    },
  ],
  getSecurityRules: () => [
    "絶対禁止: 個人情報（人物名/メールアドレス/電話番号）をマスキングせずに出力",
    "絶対禁止: 機密情報をマスキングせずに出力",
  ],
});
