import { Hono } from "hono";
import { ErrorDeDominio } from "./lib/shared/domain";
import { mapErrorDeDominioAStatus } from "./lib/shared/infrastructure/http/responses";
import { ValidationError } from "./lib/shared/infrastructure/validation/helpers";
import { crearAuthRouter } from "./lib/auth/infrastructure";
import { crearUsuarioRouter } from "./lib/usuarios/infrastructure";
import { crearPropiedadRouter } from "./lib/propiedades/infrastructure";
import { crearVentasRouter } from "./lib/ventas/infrastructure";
import { crearReportesRouter } from "./lib/reportes/infrastructure";
import { crearIntegracionesRouter } from "./lib/integraciones/infrastructure";
import {
  crearAuthControllerDeps,
  crearIntegracionesRouterDeps,
  crearPropiedadRouterDeps,
  crearReportesRouterDeps,
  crearUsuarioControllerDeps,
  crearVentasControllerDeps,
} from "./composition";
import { type D1DatabaseLike, type SessionClaims } from "./lib/shared/infrastructure";

type AppBindings = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
  INTEGRACION_WHATSAPP_SECRETO?: string;
};

type AppVariables = {
  authPayload: SessionClaims;
};

const app = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

app.get("/health", (c) => c.json({ status: "ok", service: "alvas-api" }));
app.route("/usuarios", crearUsuarioRouter(crearUsuarioControllerDeps()));
app.route("/auth", crearAuthRouter(crearAuthControllerDeps()));
app.route("/propiedades", crearPropiedadRouter(crearPropiedadRouterDeps()));
app.route("/ventas", crearVentasRouter(crearVentasControllerDeps()));
app.route("/reportes", crearReportesRouter(crearReportesRouterDeps()));
app.route("/integraciones", crearIntegracionesRouter(crearIntegracionesRouterDeps()));

app.onError((error, c) => {
  if (error instanceof ErrorDeDominio) {
    return c.json(
      { success: false, message: error.message, code: error.codigo },
      mapErrorDeDominioAStatus(error) as Parameters<typeof c.json>[1],
    );
  }

  if (error instanceof ValidationError) {
    return c.json(
      { success: false, message: "Error de validación", code: "VALIDATION_ERROR", detalles: error.details },
      400,
    );
  }

  console.error("Error no manejado:", error);
  return c.json({ success: false, message: "Error interno del servidor.", code: "ERROR_INTERNO" }, 500);
});

export default app;
