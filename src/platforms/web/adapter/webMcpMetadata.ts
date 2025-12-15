import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeWebMcpMetadata = (): McpMetadata => ({
  getSummary: () => ["外部URLから画像を取得してBase64形式で返す"],
  getUsageContext: () => [
    "外部URLの画像を読み取りたい場合",
    "Google DocsやFigmaなどから取得した画像URLの中身を確認したい場合",
    "画像の内容を解析・説明したい場合",
  ],
  getCommands: () => [
    {
      description: "URLから画像を取得しBase64で返す",
      command: "fetchImage <url>",
      usage: 'npm run cli web:fetchImage "https://example.com/image.png"',
    },
  ],
  getSecurityRules: () => [
    "内部ネットワークのURLへのアクセスは禁止",
    "取得可能なファイルサイズの上限は10MB",
  ],
});
