import { mapClaudeStopReason } from "@aiModels/claude/adapter/utils/responseMapper";

describe("responseMapper", () => {
  describe("mapClaudeStopReason", () => {
    it("end_turnをstopにマッピングすること", () => {
      expect(mapClaudeStopReason("end_turn")).toBe("stop");
    });

    it("max_tokensをlengthにマッピングすること", () => {
      expect(mapClaudeStopReason("max_tokens")).toBe("length");
    });

    it("stop_sequenceをstopにマッピングすること", () => {
      expect(mapClaudeStopReason("stop_sequence")).toBe("stop");
    });

    it("tool_useをtool-callsにマッピングすること", () => {
      expect(mapClaudeStopReason("tool_use")).toBe("tool-calls");
    });

    it("content_filterをcontent-filterにマッピングすること", () => {
      expect(mapClaudeStopReason("content_filter")).toBe("content-filter");
    });

    it("未知の値をunknownにマッピングすること", () => {
      expect(mapClaudeStopReason("unknown_reason")).toBe("unknown");
    });
  });
});
