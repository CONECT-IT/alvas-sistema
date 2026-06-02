import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { AuthController, type AuthControllerDeps, type BindingsAuth } from "./AuthController";
import {
  h,
  json,
  success,
  error,
  validationHook,
} from "../../../shared/infrastructure/openapi/openapi-utils";
import { AuthDataSchema, schemasEntrada } from "../../../shared/infrastructure/openapi/OpenApiSchemas";

export function crearAuthRouter(deps: AuthControllerDeps) {
  const router = new OpenAPIHono<{ Bindings: BindingsAuth }>({ defaultHook: validationHook });
  const controller = new AuthController(deps);

  router.openapi(
    createRoute({
      method: "post",
      path: "/login",
      tags: ["Auth"],
      summary: "Inicia sesion",
      security: [],
      request: { body: { ...json(schemasEntrada.IniciarSesionSchema), required: true } },
      responses: { 200: success(AuthDataSchema, "Sesion iniciada"), 400: error },
    }),
    h((c) => controller.iniciarSesion(c)),
  );
  router.openapi(
    createRoute({
      method: "post",
      path: "/refresh",
      tags: ["Auth"],
      summary: "Renueva sesion",
      security: [],
      request: { body: { ...json(schemasEntrada.RenovarSesionSchema), required: true } },
      responses: { 200: success(AuthDataSchema, "Sesion renovada"), 400: error },
    }),
    h((c) => controller.renovarSesion(c)),
  );

  return router;
}
