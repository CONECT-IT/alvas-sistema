import { Hono } from "hono";
import { type SessionClaims } from "../../../shared/infrastructure";
import {
  IntegracionesController,
  type BindingsIntegraciones,
  type IntegracionesRouterDeps,
} from "./IntegracionesController";

export function crearIntegracionesRouter(deps: IntegracionesRouterDeps) {
  const router = new Hono<{
    Bindings: BindingsIntegraciones;
    Variables: { authPayload: SessionClaims };
  }>();
  const controller = new IntegracionesController(deps);

  router.post("/captaciones", (c) => controller.recibirCaptacion(c));
  router.get("/captaciones/pendientes", (c) => controller.listarCaptacionesPendientes(c));
  router.post("/captaciones/pendientes/:idCaptacion/revisar", (c) =>
    controller.revisarCaptacionPendiente(c),
  );
  router.post("/captaciones/pendientes/:idCaptacion/duplicada", (c) =>
    controller.marcarCaptacionDuplicada(c),
  );
  router.post("/captaciones/pendientes/:idCaptacion/rechazar", (c) =>
    controller.rechazarCaptacionPendiente(c),
  );
  router.post("/captaciones/pendientes/:idCaptacion/convertir", (c) =>
    controller.convertirCaptacionPendiente(c),
  );
  router.post("/webhooks/whatsapp", (c) => controller.recibirWhatsAppLead(c));

  return router;
}
