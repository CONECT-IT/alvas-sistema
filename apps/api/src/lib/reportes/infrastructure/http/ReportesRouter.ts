import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { type SessionClaims } from "../../../shared/infrastructure";
import {
  ReportesController,
  type BindingsReportes,
  type ReportesRouterDeps,
} from "./ReportesController";
import {
  h,
  success,
  error,
  bearer,
  validationHook,
} from "../../../shared/infrastructure/openapi/openapi-utils";
import {
  ResumenAccionesSchema,
  ReporteGeneralSchema,
} from "../../../shared/infrastructure/openapi/OpenApiSchemas";

export function crearReportesRouter(deps: ReportesRouterDeps) {
  const router = new OpenAPIHono<{
    Bindings: BindingsReportes;
    Variables: { authPayload: SessionClaims };
  }>({ defaultHook: validationHook });
  const controller = new ReportesController(deps);

  router.openapi(
    createRoute({
      method: "get",
      path: "/estadisticas-globales",
      tags: ["Reportes"],
      summary: "Resumen global de acciones comerciales",
      security: bearer,
      responses: { 200: success(ResumenAccionesSchema, "Resumen de acciones"), 403: error },
    }),
    h((c) => controller.estadisticasGlobales(c)),
  );
  router.openapi(
    createRoute({
      method: "get",
      path: "/general",
      tags: ["Reportes"],
      summary: "Reporte general de acciones recientes",
      security: bearer,
      responses: { 200: success(ReporteGeneralSchema, "Reporte general"), 403: error },
    }),
    h((c) => controller.reporteGeneral(c)),
  );

  return router;
}
