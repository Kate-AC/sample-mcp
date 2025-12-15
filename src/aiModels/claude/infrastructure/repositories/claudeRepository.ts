import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import {
  AiJsonPayload,
  AiTextPayload,
} from "@core/contracts/aiModel/aiModelPayload";
import { safeCall } from "@core/result/safeCall";
import { mapClaudeStopReason } from "../../adapter/utils/responseMapper";
import { ClaudeExtendedTextPayload } from "../../domain/repositories/claudeExtendedPayload";
import { ClaudeRepository } from "../../domain/repositories/claudeRepository";
import type {
  ClaudeContentBlock,
  ClaudeRequest,
} from "../../domain/repositories/claudeRepositoryRequestPayload";
import type {
  ClaudeCreateMessagePayload,
  ClaudeResponse,
} from "../../domain/repositories/claudeRepositoryResponsePayload";
import { loadClaudeConfig } from "../../domain/settings/claudeConfig";
import { makeClaudeApiClient } from "../http/claudeApiClient";

export const makeClaudeRepository = (
  apiClientFactory = makeClaudeApiClient,
  config = loadClaudeConfig(),
): ClaudeRepository => {
  const client = apiClientFactory();

  return {
    ask: async (messages, tools, options) => {
      return safeCall<AiTextPayload | ClaudeExtendedTextPayload>(async () => {
        if (messages.length === 0) {
          throw new Error("Messages array cannot be empty");
        }

        // メッセージをClaude APIの形式に変換
        const apiMessages = messages.map((msg) => {
          let content: string | ClaudeContentBlock[];

          if (typeof msg.content === "string") {
            content = msg.content;
          } else if (Array.isArray(msg.content)) {
            // Tool UseやTool Resultの場合はそのまま渡す
            content = msg.content as ClaudeContentBlock[];
          } else {
            content = String(msg.content);
          }

          return {
            role: msg.role,
            content,
          };
        });

        // リクエストペイロード構築
        const request: ClaudeRequest = {
          anthropic_version: config.defaultVersion,
          max_tokens: options?.max_tokens ?? config.defaultMaxTokens,
          messages: apiMessages as any,
          ...(options?.system && { system: options.system }),
          ...(options?.temperature && { temperature: options.temperature }),
          ...(tools && tools.length > 0 && { tools }),
        };

        // APIコール
        const command = new InvokeModelCommand({
          modelId: config.defaultModel,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(request),
        });

        const apiResponse = await client.send(command);

        // toolsが渡された場合はClaudeCreateMessagePayload型で受け取る
        if (tools && tools.length > 0) {
          const responseBody = JSON.parse(
            new TextDecoder().decode(apiResponse.body),
          ) as ClaudeCreateMessagePayload;

          // テキストコンテンツを抽出
          const textContent = responseBody.content
            .filter(
              (c): c is { type: "text"; text: string } => c.type === "text",
            )
            .map((c) => c.text)
            .join("\n");

          const finishReason = mapClaudeStopReason(
            responseBody.stop_reason || "end_turn",
          );
          const usage = {
            promptTokens: responseBody.usage.input_tokens,
            completionTokens: responseBody.usage.output_tokens,
            totalTokens:
              responseBody.usage.input_tokens +
              responseBody.usage.output_tokens,
          };

          const response: ClaudeExtendedTextPayload = {
            text: textContent,
            finishReason,
            usage,
            model: responseBody.model,
            metadata: {
              id: responseBody.id,
              rawContent: responseBody.content,
              stopReason: responseBody.stop_reason,
              stopSequence: responseBody.stop_sequence,
            },
          };

          return {
            data: response,
            status: 200,
            statusText: "OK",
            headers: {},
            config: {} as any,
          };
        }

        // toolsなしの通常レスポンス
        const responseBody = JSON.parse(
          new TextDecoder().decode(apiResponse.body),
        ) as ClaudeResponse;

        const text = responseBody.content[0]?.text || "";
        const finishReason = mapClaudeStopReason(responseBody.stop_reason);
        const usage = {
          promptTokens: responseBody.usage.input_tokens,
          completionTokens: responseBody.usage.output_tokens,
          totalTokens:
            responseBody.usage.input_tokens + responseBody.usage.output_tokens,
        };

        const response: AiTextPayload = {
          text,
          finishReason,
          usage,
          model: responseBody.model,
          metadata: {
            id: responseBody.id,
          },
        };

        return {
          data: response,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {} as any,
        };
      });
    },

    askJson: async (messages, _tools, options) => {
      return safeCall(async () => {
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

        // メッセージを結合してプロンプトを作成
        const prompt = messages
          .map((msg) => {
            if (typeof msg.content === "string") {
              return msg.content;
            }
            return msg.content
              .filter((c: any) => c.type === "text")
              .map((c: any) => c.text)
              .join("\n");
          })
          .join("\n");

        // リクエストペイロード構築
        const request: ClaudeRequest = {
          anthropic_version: config.defaultVersion,
          max_tokens: options?.max_tokens ?? config.defaultMaxTokens,
          messages: [
            {
              role: "user",
              content: prompt + jsonInstruction,
            },
          ],
          temperature: 0.0, // JSON生成のため温度を0に設定
          ...(options?.system && { system: options.system }),
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
        ) as ClaudeResponse;

        // レスポンステキストを取得
        const textContent = responseBody.content[0]?.text || "";

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
  };
};
