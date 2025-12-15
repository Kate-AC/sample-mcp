import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeFigmaMcpMetadata = (): McpMetadata => ({
  getSummary: () => [
    "Figmaのデザインファイルから画像・コメント・ファイル構造を取得する",
  ],
  getUsageContext: () => [
    "Figmaのデザインを確認・参照したい場合",
    "Figmaファイル内のコメントを確認したい場合",
    "デザインの画像を取得して内容を分析したい場合",
    "FigmaのURLからファイルキーやノードIDを指定して情報を取得したい場合",
  ],
  getCommands: () => [
    {
      description: "Figmaファイルのノードを画像として取得（URLを返す）",
      command: "getImages <fileKey> <nodeIds> [format] [scale]",
      usage:
        'npm run cli figma:getImages "quMBqxb444VuQASDwnMCB2" "2477-88756"',
    },
    {
      description: "Figmaファイルのコメント一覧を取得",
      command: "getComments <fileKey>",
      usage: 'npm run cli figma:getComments "quMBqxb444VuQASDwnMCB2"',
    },
    {
      description: "Figmaファイルのノード構造を取得",
      command: "getFile <fileKey> [nodeId] [depth]",
      usage: 'npm run cli figma:getFile "quMBqxb444VuQASDwnMCB2"',
    },
  ],
  getSecurityRules: () => [
    "FIGMA_API_TOKENは環境変数で管理すること",
    "取得した画像URLは一時的なものであり、永続的に保存しないこと",
  ],
});
