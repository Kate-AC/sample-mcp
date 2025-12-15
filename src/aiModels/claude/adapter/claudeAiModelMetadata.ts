import { AiModelMetadata } from "@core/contracts/aiModel/aiModelMetadata";

export const makeClaudeAiModelMetadata = (): AiModelMetadata => ({
  getSummary: () => ["Claude AIモデルを使用してメッセージを送信し、応答を取得"],
  getUsageContext: () => [
    "LLMを使った自然言語処理が必要な場合",
    "テキスト生成、要約、質問応答などのタスクを実行する場合",
    "AIアシスタントとの対話が必要な場合",
  ],
  getFunctions: () => [
    {
      description: "Claudeに質問を送信して応答を取得（テキスト形式）",
      functionName: "ask",
      usage: 'npm run cli claude:ask "こんにちは"',
    },
    {
      description: "Claudeに質問を送信して応答を取得（JSON形式）",
      functionName: "askJson",
      usage: 'npm run cli claude:askJson "このメッセージを分析してください"',
    },
  ],
  getSecurityRules: () => [],
});
