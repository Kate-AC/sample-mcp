import { AiModelMetadata } from "@core/contracts/aiModel/aiModelMetadata";

export const makeTitanAiModelMetadata = (): AiModelMetadata => ({
  getSummary: () => ["Amazon Titan Text Expressを使用してテキスト生成を行う"],
  getUsageContext: () => [
    "LLMを使った自然言語処理が必要な場合（テキスト生成、要約、質問応答など）",
  ],
  getFunctions: () => [
    {
      functionName: "ask",
      description: "Titanに質問を送信して応答を取得（テキスト形式）",
      usage: 'npm run cli titan:ask "こんにちは"',
    },
    {
      functionName: "askJson",
      description: "Titanに質問を送信して応答を取得（JSON形式）",
      usage: 'npm run cli titan:askJson "このメッセージを分析してください"',
    },
  ],
  getSecurityRules: () => [],
});
