// @ts-check

/**
 * El mutation testing queda acotado al dominio de negocio exigido por S08.
 * Controllers, casos de aplicacion, adaptadores, DTOs, puertos e index.ts
 * meten ruido sin medir directamente la robustez del nucleo hexagonal.
 *
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  testRunner: "command",
  commandRunner: {
    command: "bun test",
  },
  mutate: [
    "apps/api/src/lib/{auth,usuarios,ventas,integraciones,reportes,propiedades}/domain/**/*.ts",
    "!apps/api/src/**/*.test.ts",
    "!apps/api/src/**/dto/**/*.ts",
    "!apps/api/src/**/ports/**/*.ts",
    "!apps/api/src/**/index.ts",
  ],
  reporters: ["progress", "clear-text", "html", "json"],
  coverageAnalysis: "off",
  concurrency: 2,
  timeoutMS: 10000,
  thresholds: {
    high: 80,
    low: 70,
    break: 70,
  },
  htmlReporter: {
    fileName: "reports/mutation/index.html",
  },
  jsonReporter: {
    fileName: "reports/mutation/mutation.json",
  },
};
