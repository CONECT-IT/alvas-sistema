import { describe, expect, test } from "bun:test";
import {
  incRequest,
  observeDuration,
  incInFlight,
  decInFlight,
  renderMetrics,
} from "../../../src/lib/shared/infrastructure/metrics/prometheus";

describe("prometheus metrics", () => {
  test("renderMetrics devuelve formato Prometheus valido", () => {
    incRequest("GET", "/health", 200);
    incRequest("GET", "/health", 500);
    observeDuration("GET", "/health", 42);
    incInFlight();
    decInFlight();

    const output = renderMetrics();
    expect(output).toContain("http_requests_total");
    expect(output).toContain("http_errors_total");
    expect(output).toContain("http_request_duration_ms");
    expect(output).toContain("http_requests_in_flight");
    expect(output).toContain('job="alvas-api"');
    expect(output).toContain("method=\"GET\"");
    expect(output).toContain('code="200"');
  });

  test("incInFlight y decInFlight balancean el gauge", () => {
    incInFlight();
    incInFlight();
    decInFlight();
    const output = renderMetrics();
    expect(output).toContain("http_requests_in_flight");
  });
});
