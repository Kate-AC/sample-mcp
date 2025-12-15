import { parseToolUseRequest } from "@aiModels/claude/domain/services/toolUseRequestParser";

describe("parseToolUseRequest", () => {
  describe("正常系", () => {
    it("platform_function形式のツール名を正しく解析できること", () => {
      const result = parseToolUseRequest("web_search");

      expect(result.platformName).toBe("web");
      expect(result.functionName).toBe("search");
    });

    it("アンダースコアが複数含まれるツール名を正しく解析できること", () => {
      const result = parseToolUseRequest("slack_getThreadMessages");

      expect(result.platformName).toBe("slack");
      expect(result.functionName).toBe("getThreadMessages");
    });

    it("アンダースコアが3つ以上含まれるツール名を正しく解析できること", () => {
      const result = parseToolUseRequest("redmine_getIssueById");

      expect(result.platformName).toBe("redmine");
      expect(result.functionName).toBe("getIssueById");
    });

    it("アンダースコアが4つ以上含まれるツール名を正しく解析できること", () => {
      const result = parseToolUseRequest("test_getUserByIdAndName");

      expect(result.platformName).toBe("test");
      expect(result.functionName).toBe("getUserByIdAndName");
    });

    it("様々なプラットフォーム名を正しく解析できること", () => {
      const platforms = [
        "web",
        "slack",
        "redmine",
        "redash",
        "github",
        "growi",
        "google",
      ];

      platforms.forEach((platform) => {
        const result = parseToolUseRequest(`${platform}_testFunction`);

        expect(result.platformName).toBe(platform);
        expect(result.functionName).toBe("testFunction");
      });
    });

    it("アンダースコアが1つのみで関数名が空の場合は正しく解析できること", () => {
      const result = parseToolUseRequest("web_");

      expect(result.platformName).toBe("web");
      expect(result.functionName).toBe("");
    });
  });

  describe("異常系", () => {
    it("アンダースコアが含まれていない場合はエラーをスローすること", () => {
      expect(() => parseToolUseRequest("websearch")).toThrow(
        "Invalid tool name format: websearch",
      );
    });

    it("空文字列の場合はエラーをスローすること", () => {
      expect(() => parseToolUseRequest("")).toThrow(
        "Invalid tool name format: ",
      );
    });

    it("プラットフォーム名のみの場合はエラーをスローすること", () => {
      expect(() => parseToolUseRequest("web")).toThrow(
        "Invalid tool name format: web",
      );
    });
  });
});
