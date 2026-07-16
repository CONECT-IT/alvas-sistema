import { describe, expect, test } from "bun:test";
import {
  createSpan,
  parseTraceparent,
  tracingMiddleware,
} from "../../../src/lib/shared/infrastructure/telemetry/opentelemetry";

function createContext(traceparent?: string) {
  const variables = new Map<string, unknown>();
  return {
    context: {
      req: {
        header: (name: string) => (name === "traceparent" ? traceparent : undefined),
        method: "GET",
        url: "http://localhost/health",
        path: "/health",
      },
      res: { status: 200 },
      env: {},
      set: (key: string, value: unknown) => variables.set(key, value),
    },
    variables,
  };
}

describe("OpenTelemetry tracing", () => {
  test("genera identificadores OTLP con longitudes válidas", () => {
    const span = createSpan("test", undefined, undefined, "");

    expect(span.traceId).toMatch(/^[0-9a-f]{32}$/);
    expect(span.spanId).toMatch(/^[0-9a-f]{16}$/);
  });

  test("valida y normaliza el encabezado traceparent", () => {
    const parsed = parseTraceparent(
      "00-4BF92F3577B34DA6A3CE929D0E0E4736-00F067AA0BA902B7-01",
    );

    expect(parsed).toEqual({
      traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
      parentSpanId: "00f067aa0ba902b7",
    });
    expect(parseTraceparent("invalid")).toBeUndefined();
    expect(
      parseTraceparent("00-00000000000000000000000000000000-00f067aa0ba902b7-01"),
    ).toBeUndefined();
  });

  test("continúa la traza entrante y conserva el span padre", async () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const parentSpanId = "00f067aa0ba902b7";
    const { context, variables } = createContext(
      `00-${traceId}-${parentSpanId}-01`,
    );

    await tracingMiddleware()(context, async () => {});

    const span = variables.get("span") as ReturnType<typeof createSpan>;
    expect(variables.get("traceId")).toBe(traceId);
    expect(span.traceId).toBe(traceId);
    expect(span.parentSpanId).toBe(parentSpanId);
    expect(span.endTime).not.toBeNull();
  });

  test("finaliza y marca el span cuando la petición falla", async () => {
    const { context, variables } = createContext();
    const failure = new Error("request failed");

    await expect(
      tracingMiddleware()(context, async () => {
        throw failure;
      }),
    ).rejects.toBe(failure);

    const span = variables.get("span") as ReturnType<typeof createSpan>;
    expect(span.status).toBe("ERROR");
    expect(span.endTime).not.toBeNull();
  });
});
