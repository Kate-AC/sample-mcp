import { McpMetadata } from "@core/contracts/mcp/mcpMetadata";

export const makeSlackMcpMetadata = (): McpMetadata => ({
  getSummary: () => ["Slackの情報にアクセス"],
  getUsageContext: () => [
    "チャンネル情報を確認する場合",
    "メッセージ履歴を確認する場合",
    "指示された内容がわからない場合",
    "オペレーションで過去のやり取りを確認する場合",
  ],
  getCommands: () => [
    {
      description: "チャンネル一覧を取得（channels:read スコープが必要）",
      command: "getChannels [queryParams]",
      usage: "npm run cli slack:getChannels",
    },
    {
      description: "会話履歴を取得（channels:history スコープが必要）",
      command: "getConversationHistory <channel> [queryParams]",
      usage: "npm run cli slack:getConversationHistory C3BVC5EMP limit=10",
    },
    {
      description: "ファイル情報を取得（files:read スコープが必要）",
      command: "getFileInfo <fileId>",
      usage: "npm run cli slack:getFileInfo F09GVMCG5E3",
    },
    {
      description:
        "ファイルをダウンロードしてBase64エンコードで取得（files:read スコープが必要）",
      command: "downloadFile <filePath>",
      usage:
        "npm run cli slack:downloadFile /files-pri/T025DB6EA-F09GVMCG5E3/download/____________________________2025-09-26_19.36.45.png",
    },
    {
      description: `メッセージを投稿（chat:write スコープが必要）\n npm run cli slack:postMessage C09L24UTM8A "message" '{"username": "hoge", "icon_emoji": ":robot_face:"}' で投稿者の設定を変更できる`,
      command: "postMessage <channel> <text> [iconEmoji]",
      usage: 'npm run cli slack:postMessage C09L24UTM8A "message"',
    },
    {
      description:
        "スレッドメッセージ（親メッセージとその返信）を取得（channels:history スコープが必要）",
      command: "getThreadMessages <messageUrl>",
      usage:
        "npm run cli slack:getThreadMessages /archives/C09L24UTM8A/p1760259631615889",
    },
    {
      description:
        "特定のリアクションが押されているメッセージを取得（channels:history, reactions:read スコープが必要）",
      command: "getMessagesWithReaction <channel> <reactionName> [queryParams]",
      usage:
        "npm run cli slack:getMessagesWithReaction C09L24UTM8A white_check_mark limit=100",
    },
    {
      description:
        "ワークスペース全体でメッセージを検索（search:read スコープが必要）",
      command: "searchMessages <query> [queryParams]",
      usage: 'npm run cli slack:searchMessages "copilot ライセンス" count=20',
    },
    {
      description:
        "メッセージにリアクション（スタンプ）を追加（reactions:write スコープが必要）",
      command: "addReaction <messageUrl> <reactionName>",
      usage:
        'npm run cli slack:addReaction "https://workspace.slack.com/archives/C09L24UTM8A/p1760259631615889" white_check_mark',
    },
  ],
  getSecurityRules: () => [
    "絶対禁止: ファイルの削除・アップロード・アーカイブ・非公開化する行為",
    "絶対禁止: 個人情報（人物名/メールアドレス/電話番号）を記載する行為",
    "絶対禁止: 機密情報を記載する行為",
    "絶対禁止: 指示がない状態で書き込みを行う行為",
  ],
});
