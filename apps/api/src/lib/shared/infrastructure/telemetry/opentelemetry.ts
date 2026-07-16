// OpenTelemetry instrumentation for ALVAS API
// This module sets up distributed tracing with Jaeger

const JAEGER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://jaeger.jaeger.svc.cluster.local:4318";
const SERVICE_NAME = "alvas-api";

let traceIdCounter = 0;

function generateTraceId(): string {
  traceIdCounter++;
  return Date.now().toString(16).padStart(16, "0") + traceIdCounter.toString(16).padStart(16, "0");
}

function generateSpanId(): string {
  return Math.random().toString(16).substr(2, 16);
}

export function createSpan(name: string, parentSpanId?: string, parentTraceId?: string) {
  const traceId = parentTraceId || generateTraceId();
  const spanId = generateSpanId();
  const startTime = Date.now();

  return {
    traceId,
    spanId,
    parentSpanId: parentSpanId || null,
    name,
    startTime,
    endTime: null as number | null,
    attributes: {} as Record<string, string>,
    status: "OK" as "OK" | "ERROR",

    setAttribute(key: string, value: string) {
      this.attributes[key] = value;
      return this;
    },

    end() {
      this.endTime = Date.now();
      this.export().catch((e) => console.error("Trace export failed:", e));
      return this;
    },

    async export() {
      if (!this.endTime) {
        console.error("[TRACE] export called but endTime is null");
        return;
      }
      console.log(`[TRACE] exporting span: ${this.name} traceId=${this.traceId}`);

      const span = {
        resourceSpans: [
          {
            resource: {
              attributes: [
                { key: "service.name", value: { stringValue: SERVICE_NAME } },
              ],
            },
            scopeSpans: [
              {
                scope: { name: "alvas-api", version: "1.0.0" },
                spans: [
                  {
                    traceId: this.traceId,
                    spanId: this.spanId,
                    parentSpanId: this.parentSpanId,
                    name: this.name,
                    kind: 1, // SERVER
                    startTimeUnixNano: (this.startTime * 1_000_000).toString(),
                    endTimeUnixNano: (this.endTime * 1_000_000).toString(),
                    attributes: Object.entries(this.attributes).map(([key, value]) => ({
                      key,
                      value: { stringValue: value },
                    })),
                    status: { code: this.status === "OK" ? 1 : 2 },
                  },
                ],
              },
            ],
          },
        ],
      };

      try {
        const resp = await fetch(`${JAEGER_OTLP_ENDPOINT}/v1/traces`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(span),
        });
        console.log(`[TRACE] OTLP response: ${resp.status} ${resp.statusText}`);
        if (!resp.ok) {
          console.error(`[TRACE] OTLP export FAILED: ${resp.status} ${await resp.text()}`);
        }
      } catch (error) {
        console.error("[TRACE] Failed to export trace:", error);
      }
    },
  };
}

export function tracingMiddleware() {
  return async (c: { req: { header: (name: string) => string | undefined; method: string; url: string; path: string }; res: { status: number }; set: (key: string, value: unknown) => void }, next: () => Promise<void>) => {
    const traceId = c.req.header("traceparent")?.split("-")[1] || generateTraceId();
    const span = createSpan(`HTTP ${c.req.method} ${c.req.path}`);
    span.setAttribute("http.method", c.req.method);
    span.setAttribute("http.url", c.req.url);
    span.setAttribute("http.target", c.req.path);

    c.set("traceId", traceId);
    c.set("span", span);

    await next();

    span.setAttribute("http.status_code", c.res.status.toString());
    if (c.res.status >= 400) {
      span.status = "ERROR";
    }
    span.end();
  };
}
