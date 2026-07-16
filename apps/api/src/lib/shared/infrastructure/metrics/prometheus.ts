const counters = {
  http_requests_total: new Map<string, number>(),
  http_errors_total: new Map<string, number>(),
};

const histograms = {
  http_request_duration_ms: new Map<string, number[]>(),
};

const gauges = {
  http_requests_in_flight: 0,
};

export function incRequest(method: string, path: string, status: number) {
  const key = `${method} ${path} ${status}`;
  counters.http_requests_total.set(key, (counters.http_requests_total.get(key) ?? 0) + 1);

  if (status >= 400) {
    const errKey = `${method} ${path} ${status}`;
    counters.http_errors_total.set(errKey, (counters.http_errors_total.get(errKey) ?? 0) + 1);
  }
}

export function observeDuration(method: string, path: string, durationMs: number) {
  const key = `${method} ${path}`;
  const existing = histograms.http_request_duration_ms.get(key) ?? [];
  existing.push(durationMs);
  histograms.http_request_duration_ms.set(key, existing);
}

export function incInFlight() {
  gauges.http_requests_in_flight++;
}

export function decInFlight() {
  gauges.http_requests_in_flight--;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

export function renderMetrics(): string {
  const lines: string[] = [];
  const job = "alvas-api";

  lines.push("# HELP http_requests_total Total de peticiones HTTP");
  lines.push("# TYPE http_requests_total counter");
  for (const [key, val] of counters.http_requests_total) {
    const [method, path, status] = key.split(" ");
    lines.push(`http_requests_total{job="${job}",method="${method}",path="${path}",code="${status}"} ${val}`);
  }

  lines.push("");
  lines.push("# HELP http_errors_total Total de errores HTTP (status >= 400)");
  lines.push("# TYPE http_errors_total counter");
  for (const [key, val] of counters.http_errors_total) {
    const [method, path, status] = key.split(" ");
    lines.push(`http_errors_total{job="${job}",method="${method}",path="${path}",code="${status}"} ${val}`);
  }

  lines.push("");
  lines.push("# HELP http_request_duration_ms Duracion de peticiones HTTP");
  lines.push("# TYPE http_request_duration_ms summary");
  for (const [key, durations] of histograms.http_request_duration_ms) {
    const sorted = [...durations].sort((a, b) => a - b);
    const [method, path] = key.split(" ");
    const labels = `job="${job}",method="${method}",path="${path}"`;
    lines.push(`http_request_duration_ms{${labels},quantile="0.5"} ${percentile(sorted, 50)}`);
    lines.push(`http_request_duration_ms{${labels},quantile="0.9"} ${percentile(sorted, 90)}`);
    lines.push(`http_request_duration_ms{${labels},quantile="0.99"} ${percentile(sorted, 99)}`);
    lines.push(`http_request_duration_ms_sum{${labels}} ${durations.reduce((a, b) => a + b, 0)}`);
    lines.push(`http_request_duration_ms_count{${labels}} ${durations.length}`);
  }

  lines.push("");
  lines.push("# HELP http_requests_in_flight Peticiones en proceso");
  lines.push("# TYPE http_requests_in_flight gauge");
  lines.push(`http_requests_in_flight{job="${job}"} ${gauges.http_requests_in_flight}`);

  return lines.join("\n") + "\n";
}
