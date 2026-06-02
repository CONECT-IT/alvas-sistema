import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  UsuarioController,
  type BindingsUsuarios,
  type UsuarioControllerDeps,
} from "./UsuarioController";
import {
  h,
  json,
  success,
  error,
  bearer,
  idParam,
  validationHook,
} from "../../../shared/infrastructure/openapi/openapi-utils";
import {
  UsuarioSchema,
  schemasEntrada,
} from "../../../shared/infrastructure/openapi/OpenApiSchemas";

export const crearUsuarioRouter = (deps: UsuarioControllerDeps) => {
  const router = new OpenAPIHono<{ Bindings: BindingsUsuarios }>({ defaultHook: validationHook });
  const controller = new UsuarioController(deps);

  router.openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Usuarios"],
      summary: "Lista usuarios",
      security: bearer,
      responses: { 200: success(z.array(UsuarioSchema), "Usuarios"), 401: error },
    }),
    h((c) => controller.listar(c)),
  );
  router.openapi(
    createRoute({
      method: "post",
      path: "/",
      tags: ["Usuarios"],
      summary: "Crea usuario",
      security: bearer,
      request: { body: { ...json(schemasEntrada.CrearUsuarioSchema), required: true } },
      responses: { 201: success(UsuarioSchema, "Usuario creado"), 400: error },
    }),
    h((c) => controller.crear(c)),
  );
  router.openapi(
    createRoute({
      method: "get",
      path: "/{idUsuario}",
      tags: ["Usuarios"],
      summary: "Obtiene usuario por id",
      security: bearer,
      request: { params: idParam("idUsuario") },
      responses: { 200: success(UsuarioSchema, "Usuario"), 404: error },
    }),
    h((c) => controller.obtener(c)),
  );
  router.openapi(
    createRoute({
      method: "put",
      path: "/{idUsuario}",
      tags: ["Usuarios"],
      summary: "Actualiza usuario",
      security: bearer,
      request: {
        params: idParam("idUsuario"),
        body: { ...json(schemasEntrada.ActualizarUsuarioSchema), required: true },
      },
      responses: { 200: success(UsuarioSchema, "Usuario actualizado"), 400: error },
    }),
    h((c) => controller.actualizar(c)),
  );

  return router;
};
