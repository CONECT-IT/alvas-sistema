import { readFileSync, writeFileSync } from "fs";

const results = JSON.parse(readFileSync("k6-results.json", "utf-8"));

const metrics = {};
const checks = [];

for (const entry of results) {
  if (entry.type === "Point" && entry.metric) {
    if (!metrics[entry.metric]) metrics[entry.metric] = [];
    metrics[entry.metric].push(entry.data);
  }
  if (entry.type === "Point" && entry.check) {
    checks.push(entry);
  }
}

function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}

function p95(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil(0.95 * sorted.length) - 1;
  return sorted[idx].toFixed(2);
}

const durations = metrics["http_req_duration"] || [];
const failed = metrics["http_req_failed"] || [];
const successRate =
  failed.length > 0
    ? ((1 - failed.filter((d) => d > 0).length / failed.length) * 100).toFixed(1)
    : 0;

const checkNames = [...new Set(checks.map((c) => c.check))];

const summaryData = {
  totalRequests: durations.length,
  avgDuration: avg(durations),
  p95Duration: p95(durations),
  successRate,
  checkNames,
};

const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>k6 Benchmark Report</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; background: #0f172a; color: #e2e8f0; }
  h1 { color: #38bdf8; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
  .card { background: #1e293b; border-radius: 8px; padding: 1.25rem; text-align: center; }
  .card .value { font-size: 2rem; font-weight: bold; color: #38bdf8; }
  .card .label { font-size: 0.875rem; color: #94a3b8; }
  .check-list { list-style: none; padding: 0; }
  .check-list li { padding: 0.5rem 0; border-bottom: 1px solid #334155; }
  .pass { color: #4ade80; } .fail { color: #f87171; }
</style></head>
<body>
  <h1>k6 Benchmark Report</h1>
  <div class="grid">
    <div class="card"><div class="value">${summaryData.totalRequests}</div><div class="label">Total Requests</div></div>
    <div class="card"><div class="value">${summaryData.avgDuration}ms</div><div class="label">Avg Duration</div></div>
    <div class="card"><div class="value">${summaryData.p95Duration}ms</div><div class="label">P95 Duration</div></div>
    <div class="card"><div class="value">${summaryData.successRate}%</div><div class="label">Success Rate</div></div>
  </div>
  <h2>Checks</h2>
  <ul class="check-list">
    ${checks
      .filter((c) => c.check === summaryData.checkNames[0])
      .map(
        (c) =>
          '<li><span class="' +
          (c.data > 0 ? "pass" : "fail") +
          '">' +
          c.check +
          ": " +
          (c.data > 0 ? "PASS" : "FAIL") +
          "</span></li>",
      )
      .join("\n    ")}
  </ul>
  <p style="color:#64748b;margin-top:2rem">Generated at ${new Date().toISOString()}</p>
</body></html>`;

writeFileSync("k6-report.html", html);
console.log("Report generated: k6-report.html");
