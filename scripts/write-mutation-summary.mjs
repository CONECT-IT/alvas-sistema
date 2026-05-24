#!/usr/bin/env bun

const [, , reportPath = "reports/mutation/mutation.json"] = process.argv;

const report = await Bun.file(reportPath)
  .json()
  .catch(() => null);

if (!report) {
  console.log(`No se encontro el reporte de mutation testing: ${reportPath}`);
  process.exit(0);
}

const metrics =
  report.systemUnderTestMetrics?.metrics ??
  report.metrics ??
  report.projectMetrics?.metrics ??
  report;

const score =
  metrics.mutationScore ?? metrics.mutationScoreBasedOnCoveredCode ?? metrics.score ?? 0;

const killed = metrics.killed ?? 0;
const survived = metrics.survived ?? 0;
const timeout = metrics.timeout ?? 0;
const noCoverage = metrics.noCoverage ?? 0;
const totalDetected = killed + timeout;
const totalUndetected = survived + noCoverage;

console.log("| Metrica | Valor |");
console.log("| --- | ---: |");
console.log(`| Mutation score | ${Number(score).toFixed(2)}% |`);
console.log(`| Mutantes killed | ${killed} |`);
console.log(`| Mutantes timeout | ${timeout} |`);
console.log(`| Mutantes survived | ${survived} |`);
console.log(`| Sin coverage | ${noCoverage} |`);
console.log(`| Detectados | ${totalDetected} |`);
console.log(`| No detectados | ${totalUndetected} |`);
