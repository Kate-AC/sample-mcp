import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeGoogleMcpMetadata = (): McpMetadata => ({
  getSummary: () => [
    "Google Workspace（Calendar、Docs、Sheets、Drive）にアクセス",
  ],
  getUsageContext: () => [
    "スケジュール管理が必要な場合",
    "ドキュメントやスプレッドシートの内容を確認する場合",
    "Google Driveのファイルを検索する場合",
  ],
  getCommands: () => [
    {
      description: "カレンダーイベントを取得",
      command: "getCalendarEvents <apiPath> [queryParams]",
      usage: "npm run cli google:getCalendarEvents /calendars/primary/events",
    },
    {
      description: "Google Docs文書を取得（タブは任意で指定可能）",
      command: "getDocument <documentId> [tabId]",
      usage:
        "npm run cli google:getDocument 19MU_vmGR3Z3PUXdB0UgZ9iAmAR3jAEdPshcN23cyTsE t.wx47ac7xno4c",
    },
    {
      description: "Google Sheetsスプレッドシートを取得",
      command: "getSpreadsheet <apiPath>",
      usage:
        "npm run cli google:getSpreadsheet /spreadsheets/1ySIWzJ5SCsm_welL6rMOq1D55OBDhGKDEBHFSXYCGug",
    },
    {
      description: "シートの値を取得",
      command: "getSheetValues <apiPath>",
      usage:
        "npm run cli google:getSheetValues /spreadsheets/1ySIWzJ5SCsm_welL6rMOq1D55OBDhGKDEBHFSXYCGug/values/A1:D5",
    },
    {
      description: "シートに値を追記する",
      command:
        "appendSheetValues <spreadsheetId> <range> <values> [valueInputOption]",
      usage: `npm run cli google:appendSheetValues 1txkmMTc2p6OZA97h2fxOuq_w8-zjbOh7F_ikDcjPm4w 'シート1' '[["test","data"]]' USER_ENTERED`,
    },
    {
      description: "シートの値を更新する",
      command:
        "updateSheetValues <spreadsheetId> <range> <values> [valueInputOption]",
      usage: `npm run cli google:updateSheetValues 1txkmMTc2p6OZA97h2fxOuq_w8-zjbOh7F_ikDcjPm4w 'シート1!A1:B1' '[["updated","data"]]' USER_ENTERED`,
    },
    {
      description: "Driveファイル情報を取得",
      command: "getDriveFile <apiPath>",
      usage:
        "npm run cli google:getDriveFile /files/1ySIWzJ5SCsm_welL6rMOq1D55OBDhGKDEBHFSXYCGug",
    },
    {
      description: "Driveファイルを検索",
      command: "searchDriveFiles <apiPath> [queryParams]",
      usage: "npm run cli google:searchDriveFiles /files",
    },
  ],
  getSecurityRules: () => [
    "絶対禁止: 指示がない状態でスプレッドシートへの追加・更新を行う行為",
  ],
});
