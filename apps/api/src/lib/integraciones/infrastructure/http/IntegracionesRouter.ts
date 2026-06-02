import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { type SessionClaims } from "../../../shared/infrastructure";
import {
  IntegracionesController,
  type BindingsIntegraciones,
  type IntegracionesRouterDeps,
} from "./IntegracionesController";
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
import { schemasEntrada } from "../../../shared/infrastructure/openapi/OpenApiSchemas";

const sinSeguridad = [] as { bearerAuth: string[] }[];

/** @group Rutas */
export function crearIntegracionesRouter(deps: IntegracionesRouterDeps) {
  const router = new OpenAPIHono<{
    Bindings: BindingsIntegraciones;
    Variables: { authPayload: SessionClaims };
  }>({ defaultHook: validationHook });
  const controller = new IntegracionesController(deps);

  router.openapi(
    createRoute({
      method: "post",
      path: "/captaciones",
      tags: ["Integraciones"],
      summary: "Recibe captacion entrante",
      security: sinSeguridad,
      request: { body: { ...json(schemasEntrada.CaptacionEntranteSchema), required: true } },
      responses: { 200: successOnly("Captacion recibida"), 400: error },
    }),
    h((c) => controller.recibirCaptacion(c)),
  );
  router.openapi(
    createRoute({
      method: "get",
      path: "/captaciones/pendientes",
      tags: ["Integraciones"],
      summary: "Lista captaciones pendientes",
      security: bearer,
      responses: {
        200: success(z.array(z.record(z.string(), z.unknown())), "Captaciones pendientes"),
      },
    }),
    h((c) => controller.listarCaptacionesPendientes(c)),
  );
  router.openapi(
    createRoute({
      method: "post",
      path: "/captaciones/pendientes/{idCaptacion}/revisar",
      tags: ["Integraciones"],
      summary: "Marca captacion pendiente como revisada",
      security: bearer,
      request: { params: idParam("idCaptacion") },
      responses: { 200: successOnly("Captacion revisada"), 400: error },
    }),
    h((c) => controller.revisarCaptacionPendiente(c)),
  );
  router.openapi(
    createRoute({
      method: "post",
      path: "/captaciones/pendientes/{idCaptacion}/duplicada",
      tags: ["Integraciones"],
      summary: "Marca captacion pendiente como duplicada",
      security: bearer,
      request: {
        params: idParam("idCaptacion"),
        body: { ...json(schemasEntrada.MarcarDuplicadaSchema), required: false },
      },
      responses: { 200: successOnly("Captacion duplicada"), 400: error },
    }),
    h((c) => controller.marcarCaptacionDuplicada(c)),
  );
  router.openapi(
    createRoute({
      method: "post",
      path: "/captaciones/pendientes/{idCaptacion}/rechazar",
      tags: ["Integraciones"],
      summary: "Rechaza captacion pendiente",
      security: bearer,
      request: {
        params: idParam("idCaptacion"),
        body: { ...json(schemasEntrada.RechazarCaptacionSchema), required: false },
      },
      responses: { 200: successOnly("Captacion rechazada"), 400: error },
    }),
    h((c) => controller.rechazarCaptacionPendiente(c)),
  );
  router.openapi(
    createRoute({
      method: "post",
      path: "/captaciones/pendientes/{idCaptacion}/convertir",
      tags: ["Integraciones"],
      summary: "Convierte captacion pendiente a lead",
      security: bearer,
      request: {
        params: idParam("idCaptacion"),
        body: { ...json(schemasEntrada.ConvertirCaptacionSchema), required: false },
      },
      responses: { 200: successOnly("Captacion convertida"), 400: error },
    }),
    h((c) => controller.convertirCaptacionPendiente(c)),
  );
  router.openapi(
    createRoute({
      method: "post",
      path: "/webhooks/whatsapp",
      tags: ["Integraciones"],
      summary: "Webhook de WhatsApp",
      security: sinSeguridad,
      request: { body: { ...json(schemasEntrada.WhatsAppWebhookSchema), required: true } },
      responses: { 200: successOnly("Webhook procesado"), 400: error },
    }),
    h((c) => controller.recibirWhatsAppLead(c)),
  );

  return router;
}
