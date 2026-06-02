import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { type SessionClaims } from "../../../shared/infrastructure";
import { type IAutorizadorPropiedades } from "../../domain/ports";
import {
  PropiedadController,
  type BindingsPropiedades,
  type PropiedadControllerDeps,
} from "./PropiedadController";
import {
  h,
  json,
  success,
  successOnly,
  error,
  bearer,
  idParam,
  validationHook,
} from "../../../shared/infrastructure/openapi/openapi-utils";
import {
  PropiedadSchema,
  schemasEntrada,
} from "../../../shared/infrastructure/openapi/OpenApiSchemas";

export type PropiedadRouterDeps = Readonly<{
  autorizador: IAutorizadorPropiedades;
  controllerDeps: PropiedadControllerDeps;
}>;

/**
 * Fabrica el router OpenAPI de propiedades con sus rutas y controlador.
 *
 * @group Rutas
 */
export function crearPropiedadRouter(deps: PropiedadRouterDeps) {
  const router = new OpenAPIHono<{
    Bindings: BindingsPropiedades;
    Variables: { authPayload: SessionClaims };
  }>({ defaultHook: validationHook });
  const controller = new PropiedadController(deps.autorizador, deps.controllerDeps);

  router.openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Propiedades"],
      summary: "Lista propiedades",
      security: bearer,
      request: { query: z.object({ leadId: z.string().optional() }) },
      responses: { 200: success(z.array(PropiedadSchema), "Propiedades"), 401: error },
    }),
    h((c) => controller.listar(c)),
  );
  router.openapi(
    createRoute({
      method: "post",
      path: "/",
      tags: ["Propiedades"],
      summary: "Crea propiedad",
      security: bearer,
      request: { body: { ...json(schemasEntrada.CrearPropiedadSchema), required: true } },
      responses: { 201: success(PropiedadSchema, "Propiedad creada"), 400: error },
    }),
    h((c) => controller.crear(c)),
  );
  router.openapi(
    createRoute({
      method: "get",
      path: "/{idPropiedad}",
      tags: ["Propiedades"],
      summary: "Obtiene propiedad",
      security: bearer,
      request: { params: idParam("idPropiedad") },
      responses: { 200: success(PropiedadSchema, "Propiedad"), 404: error },
    }),
    h((c) => controller.obtener(c)),
  );
  router.openapi(
    createRoute({
      method: "put",
      path: "/{idPropiedad}",
      tags: ["Propiedades"],
      summary: "Actualiza propiedad",
      security: bearer,
      request: {
        params: idParam("idPropiedad"),
        body: { ...json(schemasEntrada.ActualizarPropiedadSchema), required: true },
      },
      responses: { 200: success(PropiedadSchema, "Propiedad actualizada"), 400: error },
    }),
    h((c) => controller.actualizar(c)),
  );
  router.openapi(
    createRoute({
      method: "delete",
      path: "/{idPropiedad}",
      tags: ["Propiedades"],
      summary: "Elimina propiedad",
      security: bearer,
      request: { params: idParam("idPropiedad") },
      responses: { 200: successOnly("Propiedad eliminada"), 404: error },
    }),
    h((c) => controller.eliminar(c)),
  );

  return router;
}
