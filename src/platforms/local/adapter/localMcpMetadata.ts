import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeLocalMcpMetadata = (): McpMetadata => ({
  getSummary: () => ["ファイルシステムへのアクセス"],
  getUsageContext: () => [
    "コードファイルを読み込む場合",
    "ディレクトリ構造を確認する場合",
    "ファイル名で検索する場合",
    "コード内の特定のパターンを検索する場合",
  ],
  getCommands: () => [
    {
      description: "指定されたパスのファイル内容を読み込む",
      command: "readFile <filePath>",
      usage: 'npm run cli local:readFile "./src/index.ts"',
    },
    {
      description: "ディレクトリ内のファイル一覧を取得する",
      command: "listFiles <dirPath> [recursive]",
      usage: 'npm run cli local:listFiles "./src" true',
    },
    {
      description: "パターンマッチでファイル名を検索する（glob形式）",
      command: "searchFilesByName <pattern> [rootPath]",
      usage: 'npm run cli local:searchFilesByName "*.ts" "./src"',
    },
    {
      description: "ファイルの中身を検索する（正規表現または文字列）",
      command: "searchCode <pattern> [rootPath] [filePattern] [contextLines]",
      usage: 'npm run cli local:searchCode ".*Repository" "./src" "*.ts" 3',
    },
    {
      description:
        "配列で渡した文字列に一致するディレクトリを再帰的に検索して返す",
      command: "findDirsByName <names> [rootPath]",
      usage:
        'npm run cli local:findDirsByName \'["order-sync"]\' "/Users/workspace"',
    },
  ],
  getSecurityRules: () => [
    "絶対禁止: ファイルの削除・変更・作成する行為",
    "絶対禁止: 個人情報や機密情報を含むファイルを読み込む行為",
    "絶対禁止: システムファイルや設定ファイルを読み込む行為",
    "読み取り専用の操作のみ許可",
  ],
});
