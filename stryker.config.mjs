// @ts-check

/**
 * El mutation testing queda acotado a la logica de negocio exigida por S07/S08:
 * entidades del dominio y casos de uso de aplicacion. Se excluyen controllers,
 * adaptadores, DTOs, puertos e index.ts porque pertenecen a bordes de entrada,
 * infraestructura o cableado.
 *
 * Baseline S07 ampliado a domain + application/use-cases: 59.40%.
 * El break queda en 59 para bloquear regresiones reales en CI mientras se
 * fortalecen asserts de casos de uso que aun dejan mutantes sobrevivientes.
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
    "apps/api/src/lib/{auth,usuarios,ventas,integraciones,reportes,propiedades}/application/use-cases/**/*.ts",
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
    high: 70,
    low: 60,
    break: 59,
  },
  htmlReporter: {
    fileName: "reports/mutation/index.html",
  },
  jsonReporter: {
    fileName: "reports/mutation/mutation.json",
  },
};
