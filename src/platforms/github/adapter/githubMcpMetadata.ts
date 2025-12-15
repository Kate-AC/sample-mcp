import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeGithubMcpMetadata = (): McpMetadata => ({
  getSummary: () => ["GitHubリポジトリやプルリクエストの情報を取得"],
  getUsageContext: () => [
    "仕様通りの実装となっているかの事実確認に使用",
    "類似の実装などの調査に使用",
  ],
  getCommands: () => [
    {
      description: "リポジトリ情報を取得",
      command: "getRepositoryInfo <apiPath>",
      usage:
        "npm run cli github:getRepositoryInfo /repos/example-org/sample-api",
    },
    {
      description: "ファイル内容を取得",
      command: "getFileContent <apiPath> [ref]",
      usage:
        "npm run cli github:getFileContent /repos/example-org/sample-api/contents/readme.md",
    },
    {
      description: "ディレクトリ内容を一覧表示",
      command: "listRepositoryContents <apiPath> [ref]",
      usage:
        "npm run cli github:listRepositoryContents /repos/example-org/sample-api/contents/app",
    },
    {
      description: "プルリクエスト情報を取得",
      command: "getPullRequest <apiPath>",
      usage:
        "npm run cli github:getPullRequest /repos/example-org/sample-api/pulls/123",
    },
    {
      description: "プルリクエストファイル一覧を取得",
      command: "getPullRequestFiles <apiPath>",
      usage:
        "npm run cli github:getPullRequestFiles /repos/example-org/sample-api/pulls/123/files",
    },
    {
      description: "ベースブランチとの差分を取得",
      command: "getPullRequestDiff <apiPath>",
      usage:
        "npm run cli github:getPullRequestDiff /repos/example-org/sample-api/pulls/123",
    },
    {
      description: "コードを検索",
      command: "searchCode <query> [perPage] [page]",
      usage:
        'npm run cli github:searchCode "addClass in:file language:js org:example-org"',
    },
    {
      description: "プルリクエストにコメントを投稿",
      command: "createPullRequestComment <apiPath> <body>",
      usage:
        'npm run cli github:createPullRequestComment /repos/example-org/sample-api/issues/123/comments "コメント内容"',
    },
  ],
  getSecurityRules: () => [
    "絶対禁止: 個人情報（人物名/メールアドレス/電話番号）はコミットおよびPRへの記載",
    "絶対禁止: 機密情報のコミットおよびPRへの記載",
    "絶対禁止: 作成指示がない場合のPR作成",
  ],
});
