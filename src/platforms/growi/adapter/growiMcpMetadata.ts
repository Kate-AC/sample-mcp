import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeGrowiMcpMetadata = (): McpMetadata => ({
  getSummary: () => ["Growi（Wiki）にアクセス"],
  getUsageContext: () => [
    "不明な用語を検索する場合",
    "指示された内容がわからない場合",
    "新しい記事を作成する場合",
    "参考情報で出力するドメインはwiki.example.com",
  ],
  getCommands: () => [
    {
      description: "ページを検索",
      command: "searchPages <searchQuery|queryParams>",
      usage: `npm run cli growi:searchPages {"q":"楽天","limit":"10"}`,
    },
    {
      description: "ページの内容を取得",
      command: "getPage <pageId>",
      usage: "npm run cli growi:getPage 685b989e21bc462caac04c2a",
    },
    {
      description:
        "ページを作成（自動的に /generated_by_ai/YYYY-MM-DD_HH-ii-SS_ のパスとプレフィックスが付与されます）",
      command: "createPage <title> <body>",
      usage:
        'npm run cli growi:createPage "新しい記事" "# 記事の内容\\n\\nここに本文を書きます"',
    },
  ],
  getSecurityRules: () => [
    "絶対禁止: ページ作成時に個人情報（人物名/メールアドレス/電話番号）を記載する行為",
    "絶対禁止: 機密情報を記載する行為",
    "絶対禁止: 指示がない状態で新規ページを作成する行為",
    "絶対禁止: 参考情報で「growi.example.com」のドメインを出力する行為",
  ],
});
