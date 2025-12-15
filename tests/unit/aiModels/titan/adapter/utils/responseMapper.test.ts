import { mapTitanCompletionReason } from "@aiModels/titan/adapter/utils/responseMapper";

describe("responseMapper", () => {
  describe("mapTitanCompletionReason", () => {
    it("FINISHをstopにマッピングすること", () => {
      expect(mapTitanCompletionReason("FINISH")).toBe("stop");
    });

    it("MAX_TOKENSをlengthにマッピングすること", () => {
      expect(mapTitanCompletionReason("MAX_TOKENS")).toBe("length");
    });

    it("STOP_SEQUENCEをstopにマッピングすること", () => {
      expect(mapTitanCompletionReason("STOP_SEQUENCE")).toBe("stop");
    });

    it("CONTENT_FILTERをcontent-filterにマッピングすること", () => {
      expect(mapTitanCompletionReason("CONTENT_FILTER")).toBe("content-filter");
    });

    it("未知の値をunknownにマッピングすること", () => {
      expect(mapTitanCompletionReason("UNKNOWN_REASON")).toBe("unknown");
    });

    it("undefinedをunknownにマッピングすること", () => {
      expect(mapTitanCompletionReason(undefined)).toBe("unknown");
    });
  });
});
