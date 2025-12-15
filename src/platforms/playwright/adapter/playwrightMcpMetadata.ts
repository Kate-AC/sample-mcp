import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makePlaywrightMcpMetadata = (): McpMetadata => ({
  getSummary: () => [
    "Playwrightを使ったブラウザ操作（ページ遷移、クリック、入力、スクリーンショット等）",
  ],
  getUsageContext: () => [
    "ブラウザで画面の動作確認を行う場合",
    "ログイン操作を自動化する場合",
    "画面のスクリーンショットを取得する場合",
    "フォームへの入力やボタンのクリックを自動化する場合",
    "ページのテキスト内容を取得する場合",
  ],
  getCommands: () => [
    {
      description: "指定URLに遷移する",
      command: "navigate <url>",
      usage: 'npm run cli playwright:navigate "https://example.com"',
    },
    {
      description: "要素をクリックする（テキストベースまたはCSSセレクタ）",
      command: "click <selector>",
      usage: 'npm run cli playwright:click "ログイン"',
    },
    {
      description: "要素にテキストを入力する",
      command: "type <selector> <text>",
      usage: 'npm run cli playwright:type "メールアドレス" "user@example.com"',
    },
    {
      description: "スクリーンショットを取得する（Base64）",
      command: "screenshot [path]",
      usage: "npm run cli playwright:screenshot",
    },
    {
      description: "ページのアクセシビリティスナップショットを取得する",
      command: "snapshot",
      usage: "npm run cli playwright:snapshot",
    },
    {
      description: "JavaScriptを実行する",
      command: "evaluate <script>",
      usage: 'npm run cli playwright:evaluate "document.title"',
    },
    {
      description: "ページのテキストコンテンツを取得する",
      command: "getTextContent",
      usage: "npm run cli playwright:getTextContent",
    },
    {
      description: "要素が表示されるまで待機する",
      command: "waitForSelector <selector> [timeout]",
      usage:
        'npm run cli playwright:waitForSelector "text=ダッシュボード" 10000',
    },
    {
      description: "セレクトボックスの値を選択する",
      command: "selectOption <selector> <values>",
      usage: 'npm run cli playwright:selectOption "#status" \'["active"]\'',
    },
  ],
  getSecurityRules: () => [
    "絶対禁止: 本番環境のURLへのアクセス",
    "絶対禁止: 個人情報（パスワード等）をログやレスポンスに含める行為",
    "QAおよび開発環境でのみ使用すること",
  ],
});
