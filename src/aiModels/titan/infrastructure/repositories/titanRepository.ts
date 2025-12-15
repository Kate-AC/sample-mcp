import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import {
  AiJsonPayload,
  AiTextPayload,
} from "@core/contracts/aiModel/aiModelPayload";
import { safeCall } from "@core/result/safeCall";
import { mapTitanCompletionReason } from "../../adapter/utils/responseMapper";
import { searchRelevantDocuments } from "../../adapter/utils/vectorSearch";
import { TitanRepository } from "../../domain/repositories/titanRepository";
import type {
  TitanEmbeddingsRequest,
  TitanRequest,
} from "../../domain/repositories/titanRepositoryRequestPayload";
import type {
  TitanEmbeddingsResponse,
  TitanResponse,
} from "../../domain/repositories/titanRepositoryResponsePayload";
import { loadTitanConfig } from "../../domain/settings/titanConfig";
import { makeTitanApiClient } from "../http/titanApiClient";

export const makeTitanRepository = (
  apiClientFactory = makeTitanApiClient,
  config = loadTitanConfig(),
): TitanRepository => {
  const client = apiClientFactory();

  const repository: TitanRepository = {
    ask: async (messages, embeddings, options) => {
      return safeCall<AiTextPayload>(async () => {
        if (messages.length === 0) {
          throw new Error("Messages array cannot be empty");
        }

        // 最後のユーザーメッセージのみを使用（Titanは会話履歴を直接サポートしていない）
        const lastUserMessage = messages.filter((m) => m.role === "user").pop();
        if (!lastUserMessage) {
          throw new Error("No user message found");
        }
        let prompt = lastUserMessage.content;

        // RAG: Embeddingsがある場合はベクトル検索を実行
        if (embeddings && embeddings.documents.length > 0) {
          // ユーザーの質問をベクトル化
          const queryVector = await repository.embed(prompt);

          // 関連文書を検索
          const relevantDocs = searchRelevantDocuments(queryVector, embeddings);

          // プロンプトに文書コンテキストを追加
          const context = relevantDocs
            .map((doc, i) => `[文書${i + 1}]\n${doc.document.text}`)
            .join("\n\n");

          prompt = `以下の文書を参考に質問に答えてください。

参考文書:
${context}

質問: ${prompt}`;
        }

        // リクエストペイロード構築
        const request: TitanRequest = {
          inputText: prompt,
          textGenerationConfig: {
            maxTokenCount: options?.max_tokens ?? config.defaultMaxTokens,
            temperature: options?.temperature ?? config.defaultTemperature,
            topP: config.defaultTopP,
            stopSequences: config.defaultStopSequences,
          },
        };

        // APIコール
        const command = new InvokeModelCommand({
          modelId: config.defaultModel,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(request),
        });

        const apiResponse = await client.send(command);
        const responseBody = JSON.parse(
          new TextDecoder().decode(apiResponse.body),
        ) as TitanResponse;

        // レスポンス変換
        const result = responseBody.results[0];
        const text = result?.outputText || "";
        const finishReason = mapTitanCompletionReason(result?.completionReason);
        const usage = {
          promptTokens: result?.inputTokenCount || 0,
          completionTokens: result?.outputTokenCount || 0,
          totalTokens:
            (result?.inputTokenCount || 0) + (result?.outputTokenCount || 0),
        };

        const response: AiTextPayload = {
          text,
          finishReason,
          usage,
          model: config.defaultModel,
          metadata: {
            id: `titan-${Date.now()}`,
          },
        };

        // ApiResponse形式でラップして返す（safeCallとの互換性のため）
        return {
          data: response,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {} as any,
        };
      });
    },

    askJson: async (messages, embeddings, options) => {
      return safeCall<AiJsonPayload>(async () => {
        const client = apiClientFactory();

        if (messages.length === 0) {
          throw new Error("Messages array cannot be empty");
        }

        const jsonInstruction = `

## 返答形式
以下のJSON形式で返答してください：

\`\`\`json
{
  "answer": "分析結果",
  "additional_links": ["https://example.com/doc"],
  "additional_commands": ["npm run cli growi:getPage 123456"],
  "additional_infos": ["補足情報"]
}
\`\`\`

重要な注意事項:
- additional_links: 参考になるURLがあれば具体的なURLを記載してください
- additional_commands: コマンドを提案する場合は、[ID]などのプレースホルダーではなく、コンテキストから取得した実際のIDを使用してください
- additional_infos: 追加の補足情報があれば記載してください
- 情報がない場合は空配列 [] を返してください`;

        // 最後のユーザーメッセージのみを使用（Titanは会話履歴を直接サポートしていない）
        const lastUserMessage = messages.filter((m) => m.role === "user").pop();
        if (!lastUserMessage) {
          throw new Error("No user message found");
        }
        let prompt = lastUserMessage.content;

        // RAG: Embeddingsがある場合はベクトル検索を実行
        if (embeddings && embeddings.documents.length > 0) {
          // ユーザーの質問をベクトル化
          const queryVector = await repository.embed(prompt);

          // 関連文書を検索
          const relevantDocs = searchRelevantDocuments(queryVector, embeddings);

          // プロンプトに文書コンテキストを追加
          const context = relevantDocs
            .map((doc, i) => `[文書${i + 1}]\n${doc.document.text}`)
            .join("\n\n");

          prompt = `以下の文書を参考に質問に答えてください。

参考文書:
${context}

質問: ${prompt}`;
        }

        // リクエストペイロード構築
        const request: TitanRequest = {
          inputText: prompt + jsonInstruction,
          textGenerationConfig: {
            maxTokenCount: options?.max_tokens ?? config.defaultMaxTokens,
            temperature: 0.0, // JSON生成のため温度を0に設定
            topP: config.defaultTopP,
            stopSequences: config.defaultStopSequences,
          },
        };

        // APIコール
        const command = new InvokeModelCommand({
          modelId: config.defaultModel,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(request),
        });

        const apiResponse = await client.send(command);
        const responseBody = JSON.parse(
          new TextDecoder().decode(apiResponse.body),
        ) as TitanResponse;

        // レスポンステキストを取得
        const result = responseBody.results[0];
        const textContent = result?.outputText || "";

        // JSON抽出
        let jsonText: string;

        const codeBlockMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1]!;
        } else {
          const answerJsonMatch = textContent.match(
            /\{\s*"answer"\s*:[\s\S]*?\n\}/,
          );
          if (answerJsonMatch) {
            jsonText = answerJsonMatch[0];
          } else {
            const firstBraceIndex = textContent.indexOf("{");
            if (firstBraceIndex !== -1) {
              let braceCount = 0;
              let endIndex = firstBraceIndex;
              for (let i = firstBraceIndex; i < textContent.length; i++) {
                if (textContent[i] === "{") braceCount++;
                if (textContent[i] === "}") {
                  braceCount--;
                  if (braceCount === 0) {
                    endIndex = i + 1;
                    break;
                  }
                }
              }
              jsonText = textContent.substring(firstBraceIndex, endIndex);
            } else {
              jsonText = textContent;
            }
          }
        }

        // JSONパース（safeCallがエラーハンドリング）
        const parsed = JSON.parse(jsonText.trim()) as AiJsonPayload;

        if (!parsed.answer && parsed.answer !== "") {
          throw new Error(
            `Response does not have 'answer' field.\n` +
              `Raw text content (first 500 chars): ${textContent.substring(0, 500)}\n` +
              `Extracted JSON text (first 500 chars): ${jsonText.trim().substring(0, 500)}`,
          );
        }

        // ApiResponse形式でラップして返す（safeCallとの互換性のため）
        return {
          data: parsed,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {} as any,
        };
      });
    },

    embed: async (text: string): Promise<number[]> => {
      const request: TitanEmbeddingsRequest = {
        inputText: text,
      };

      const command = new InvokeModelCommand({
        modelId: config.defaultEmbeddingsModel,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(request),
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(
        new TextDecoder().decode(response.body),
      ) as TitanEmbeddingsResponse;

      return responseBody.embedding;
    },

    embedBatch: async (texts: string[]): Promise<number[][]> => {
      // 並列で複数テキストをベクトル化
      const embeddings = await Promise.all(
        texts.map(async (text) => {
          const request: TitanEmbeddingsRequest = {
            inputText: text,
          };

          const command = new InvokeModelCommand({
            modelId: config.defaultEmbeddingsModel,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(request),
          });

          const response = await client.send(command);
          const responseBody = JSON.parse(
            new TextDecoder().decode(response.body),
          ) as TitanEmbeddingsResponse;

          return responseBody.embedding;
        }),
      );

      return embeddings;
    },
  };

  return repository;
};
