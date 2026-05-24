// @ts-check

const dashboardEnabled = Boolean(process.env.STRYKER_DASHBOARD_API_KEY);
const dashboardVersion = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || "local";

/**
 * El mutation testing queda acotado a la logica de negocio exigida por S07/S08:
 * entidades del dominio y casos de uso de aplicacion. Se excluyen controllers,
 * adaptadores, DTOs, puertos e index.ts porque pertenecen a bordes de entrada,
 * infraestructura o cableado.
 *
 * Umbral S07/S08: 70%. Este valor fuerza a endurecer asserts cuando los
 * mutantes sobreviven; el baseline ampliado actual fue 59.40%, por lo que
 * el pipeline debe fallar hasta cerrar esa brecha de pruebas.
 *
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  testRunner: "command",
  commandRunner: {
    command: "bun --cwd apps/api test",
  },
  mutate: [
    "apps/api/src/lib/{auth,usuarios,ventas,integraciones,reportes,propiedades}/domain/**/*.ts",
    "apps/api/src/lib/{auth,usuarios,ventas,integraciones,reportes,propiedades}/application/use-cases/**/*.ts",
    "!apps/api/src/**/*.test.ts",
    "!apps/api/src/**/dto/**/*.ts",
    "!apps/api/src/**/ports/**/*.ts",
    "!apps/api/src/**/index.ts",
  ],
  reporters: ["progress", "clear-text", "html", "json", ...(dashboardEnabled ? ["dashboard"] : [])],
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
  dashboard: {
    project: "github.com/softwarelazana-ui/alvas-sistema",
    version: dashboardVersion,
    reportType: "full",
  },
};
