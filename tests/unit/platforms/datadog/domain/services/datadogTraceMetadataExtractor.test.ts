import {
  DatadogTracePayload,
  DatadogTraceSpan,
} from "@platforms/datadog/domain/repositories/datadogRepositoryPayload";
import {
  extractMetadataFromSpan,
  extractMetadataFromTrace,
} from "@platforms/datadog/domain/services/datadogTraceMetadataExtractor";

describe("datadogTraceMetadataExtractor", () => {
  describe("extractMetadataFromSpan", () => {
    it("スパンからメタデータを正しく抽出できること", () => {
      const span: DatadogTraceSpan = {
        spanID: 123456,
        traceID: 789012,
        service: "test-service",
        name: "test-operation",
        resource: "test-resource",
        startTime: 1000000,
        endTime: 2000000,
        duration: 1000000,
        meta: {
          env: "production",
          version: "1.0.0",
          "job.company_code": "TEST001",
          "job.job_class": "TestJob",
        },
      };

      const metadata = extractMetadataFromSpan(span);

      expect(metadata.duration).toBe(1000000);
      expect(metadata.env).toBe("production");
      expect(metadata.version).toBe("1.0.0");
      expect(metadata["job.company_code"]).toBe("TEST001");
      expect(metadata["job.job_class"]).toBe("TestJob");
    });

    it("metaがundefinedの場合でもdurationは返されること", () => {
      const span: DatadogTraceSpan = {
        spanID: 123456,
        traceID: 789012,
        service: "test-service",
        name: "test-operation",
        resource: "test-resource",
        startTime: 1000000,
        endTime: 2000000,
        duration: 1000000,
      };

      const metadata = extractMetadataFromSpan(span);

      expect(metadata.duration).toBe(1000000);
    });
  });

  describe("extractMetadataFromTrace", () => {
    it("ルートスパンからメタデータを抽出できること", () => {
      const trace: DatadogTracePayload = {
        data: {
          attributes: {
            spans: [
              {
                spanID: 111,
                traceID: 999,
                parentID: 222,
                service: "child-service",
                name: "child-operation",
                resource: "child-resource",
                startTime: 1000,
                endTime: 2000,
                duration: 1000,
                meta: {
                  env: "child-env",
                },
              },
              {
                spanID: 222,
                traceID: 999,
                service: "root-service",
                name: "root-operation",
                resource: "root-resource",
                startTime: 500,
                endTime: 2500,
                duration: 2000,
                meta: {
                  env: "production",
                  version: "1.0.0",
                },
              },
            ],
          },
          id: "999",
          type: "trace",
        },
      };

      const metadata = extractMetadataFromTrace(trace);

      expect(metadata.duration).toBe(2000);
      expect(metadata.env).toBe("production");
      expect(metadata.version).toBe("1.0.0");
    });

    it("ルートスパンが見つからない場合は空オブジェクトを返すこと", () => {
      const trace: DatadogTracePayload = {
        data: {
          attributes: {
            spans: [
              {
                spanID: 111,
                traceID: 999,
                parentID: 222,
                service: "child-service",
                name: "child-operation",
                resource: "child-resource",
                startTime: 1000,
                endTime: 2000,
                duration: 1000,
              },
            ],
          },
          id: "999",
          type: "trace",
        },
      };

      const metadata = extractMetadataFromTrace(trace);

      expect(metadata).toEqual({});
    });

    it("spansが空の場合は空オブジェクトを返すこと", () => {
      const trace: DatadogTracePayload = {
        data: {
          attributes: {
            spans: [],
          },
          id: "999",
          type: "trace",
        },
      };

      const metadata = extractMetadataFromTrace(trace);

      expect(metadata).toEqual({});
    });

    it("data.attributesがundefinedの場合は空オブジェクトを返すこと", () => {
      const trace: DatadogTracePayload = {
        data: {
          attributes: {
            spans: [],
          },
          id: "999",
          type: "trace",
        },
      };

      const metadata = extractMetadataFromTrace(trace);

      expect(metadata).toEqual({});
    });
  });
});
