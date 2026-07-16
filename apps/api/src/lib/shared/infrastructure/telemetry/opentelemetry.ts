// OpenTelemetry instrumentation for ALVAS API
// This module sets up distributed tracing with Jaeger

const SERVICE_NAME = "alvas-api";

function generateHexId(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function generateTraceId(): string {
  return generateHexId(16);
}

function generateSpanId(): string {
  return generateHexId(8);
}

function getProcessOtlpEndpoint(): string | undefined {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env?.OTEL_EXPORTER_OTLP_ENDPOINT;
}

export function parseTraceparent(value?: string): { traceId: string; parentSpanId: string } | undefined {
  const match = value?.match(/^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/i);
  if (!match) {
    return undefined;
  }

  const version = match[1];
  const traceId = match[2];
  const parentSpanId = match[3];
  if (
    !version ||
    !traceId ||
    !parentSpanId ||
    version.toLowerCase() === "ff" ||
    /^0+$/.test(traceId) ||
    /^0+$/.test(parentSpanId)
  ) {
    return undefined;
  }

  return { traceId: traceId.toLowerCase(), parentSpanId: parentSpanId.toLowerCase() };
}

export function createSpan(
  name: string,
  parentSpanId?: string,
  parentTraceId?: string,
  otlpEndpoint = getProcessOtlpEndpoint(),
) {
  const traceId = parentTraceId ?? generateTraceId();
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
                    ...(this.parentSpanId ? { parentSpanId: this.parentSpanId } : {}),
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

      if (!otlpEndpoint) {
        return;
      }

      console.log(`[TRACE] exporting span: ${this.name} traceId=${this.traceId}`);

      try {
        const resp = await fetch(`${otlpEndpoint.replace(/\/$/, "")}/v1/traces`, {
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
  return async (
    c: {
      req: { header: (name: string) => string | undefined; method: string; url: string; path: string };
      res: { status: number };
      env?: { OTEL_EXPORTER_OTLP_ENDPOINT?: string };
      set: (key: string, value: unknown) => void;
    },
    next: () => Promise<void>,
  ) => {
    const parentContext = parseTraceparent(c.req.header("traceparent"));
    const span = createSpan(
      `HTTP ${c.req.method} ${c.req.path}`,
      parentContext?.parentSpanId,
      parentContext?.traceId,
      c.env?.OTEL_EXPORTER_OTLP_ENDPOINT ?? getProcessOtlpEndpoint(),
    );
    span.setAttribute("http.method", c.req.method);
    span.setAttribute("http.url", c.req.url);
    span.setAttribute("http.target", c.req.path);

    c.set("traceId", span.traceId);
    c.set("span", span);

    try {
      await next();
      span.setAttribute("http.status_code", c.res.status.toString());
      if (c.res.status >= 400) {
        span.status = "ERROR";
      }
    } catch (error) {
      span.status = "ERROR";
      throw error;
    } finally {
      span.end();
    }
  };
}
