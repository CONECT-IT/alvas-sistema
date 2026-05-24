import { Hono } from "hono";
import { type SessionClaims, verifySessionMiddleware } from "../../../shared/infrastructure";
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
  router.get("/captaciones/pendientes", verifySessionMiddleware(), (c) =>
    controller.listarCaptacionesPendientes(c),
  );
  router.post("/webhooks/whatsapp", (c) => controller.recibirWhatsAppLead(c));

  return router;
}
