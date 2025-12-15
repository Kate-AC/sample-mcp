import type { ClaudeToolUseResultContent } from "@aiModels/claude/domain/repositories/claudeRepositoryRequestPayload";
import { convertToolUseResultForImages } from "@aiModels/claude/domain/services/toolUseDataSetBuilder";

describe("convertToolUseResultForImages", () => {
  describe("正常系", () => {
    it("画像ペイロード（base64 + mimeType）を含むJSON文字列を画像ブロックに変換すること", () => {
      const result: ClaudeToolUseResultContent = {
        type: "tool_result",
        tool_use_id: "toolu_123",
        content: JSON.stringify({
          base64: "iVBORw0KGgo=",
          mimeType: "image/png",
          size: 12345,
        }),
      };

      const converted = convertToolUseResultForImages(result);

      expect(converted).toEqual({
        type: "tool_result",
        tool_use_id: "toolu_123",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: "iVBORw0KGgo=",
            },
          },
        ],
      });
    });

    it("画像以外のJSON文字列はそのまま返すこと", () => {
      const result: ClaudeToolUseResultContent = {
        type: "tool_result",
        tool_use_id: "toolu_123",
        content: JSON.stringify({ answer: "hello", score: 42 }),
      };

      const converted = convertToolUseResultForImages(result);

      expect(converted).toBe(result);
    });

    it("contentが既に配列（非文字列）の場合はそのまま返すこと", () => {
      const result: ClaudeToolUseResultContent = {
        type: "tool_result",
        tool_use_id: "toolu_123",
        content: [{ type: "text", text: "already converted" }],
      };

      const converted = convertToolUseResultForImages(result);

      expect(converted).toBe(result);
    });

    it("JSONパースに失敗する文字列はそのまま返すこと", () => {
      const result: ClaudeToolUseResultContent = {
        type: "tool_result",
        tool_use_id: "toolu_123",
        content: "not valid json",
      };

      const converted = convertToolUseResultForImages(result);

      expect(converted).toBe(result);
    });

    it("base64のみでmimeTypeがないオブジェクトは画像として扱わないこと", () => {
      const result: ClaudeToolUseResultContent = {
        type: "tool_result",
        tool_use_id: "toolu_123",
        content: JSON.stringify({ base64: "iVBORw0KGgo=" }),
      };

      const converted = convertToolUseResultForImages(result);

      expect(converted).toBe(result);
    });

    it("mimeTypeのみでbase64がないオブジェクトは画像として扱わないこと", () => {
      const result: ClaudeToolUseResultContent = {
        type: "tool_result",
        tool_use_id: "toolu_123",
        content: JSON.stringify({ mimeType: "image/png" }),
      };

      const converted = convertToolUseResultForImages(result);

      expect(converted).toBe(result);
    });

    it("base64やmimeTypeが文字列でない場合は画像として扱わないこと", () => {
      const result: ClaudeToolUseResultContent = {
        type: "tool_result",
        tool_use_id: "toolu_123",
        content: JSON.stringify({ base64: 123, mimeType: true }),
      };

      const converted = convertToolUseResultForImages(result);

      expect(converted).toBe(result);
    });
  });
});
