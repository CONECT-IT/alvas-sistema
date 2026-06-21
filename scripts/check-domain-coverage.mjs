#!/usr/bin/env bun

const [, , lcovPath = "coverage/lcov.info", thresholdArg = "80"] = process.argv;
const threshold = Number(thresholdArg);

if (!Number.isFinite(threshold)) {
  console.error(`Invalid coverage threshold: ${thresholdArg}`);
  process.exit(1);
}

const lcov = await Bun.file(lcovPath)
  .text()
  .catch(() => null);

if (!lcov) {
  console.error(`Coverage file not found: ${lcovPath}`);
  process.exit(1);
}

let foundFiles = 0;
let linesFound = 0;
let linesHit = 0;

for (const record of lcov.split("end_of_record")) {
  const sourceFile = record
    .split(/\r?\n/)
    .find((line) => line.startsWith("SF:"))
    ?.slice(3)
    .replaceAll("\\", "/");

  if (!sourceFile) {
    continue;
  }

  const lf = Number(record.match(/^LF:(\d+)/m)?.[1] ?? 0);
  const lh = Number(record.match(/^LH:(\d+)/m)?.[1] ?? 0);

  foundFiles += 1;
  linesFound += lf;
  linesHit += lh;
}

if (foundFiles === 0 || linesFound === 0) {
  console.error("No coverage entries found in lcov report.");
  process.exit(1);
}

const coverage = (linesHit / linesFound) * 100;
const formatted = coverage.toFixed(2);

console.log(`Global line coverage: ${formatted}% (${linesHit}/${linesFound})`);

if (coverage < threshold) {
  console.error(`Coverage ${formatted}% is below ${threshold}% quality gate.`);
  process.exit(1);
}
