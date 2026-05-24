import { describe, expect, it } from "bun:test";
import { Hono } from "hono";

import { resultadoExitoso, resultadoFallido } from "../../../src/lib/shared";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";
import {
  crearIntegracionesRouter,
  type IntegracionesRouterDeps,
} from "../../../src/lib/integraciones/infrastructure";
import { crearAuthHeader, envConAuth } from "../helpers/auth";

const captacionProcesada = {
  idLead: "lead-captacion-1",
  idPropiedadPreliminar: "propiedad-preliminar-1",
};

const captacionPendiente = {
  id: "captacion-1",
  canal: "WHATSAPP",
  origen: "whatsapp_webhook",
  nombre: "Carlos Comprador",
  telefono: "59170000002",
  email: "59170000002@contacto.whatsapp.local",
  tipo: "COMPRA",
  estado: "PENDIENTE",
  idPropiedadInteres: "propiedad-1",
  metadata: { canal: "whatsapp" },
  creadoEn: "2026-05-24T04:00:00.000Z",
  actualizadoEn: "2026-05-24T04:00:00.000Z",
} as const;

function crearDeps(): IntegracionesRouterDeps & {
  readonly ultimaCaptacionInput: unknown;
  readonly ultimoWhatsAppInput: unknown;
} {
  let ultimaCaptacionInput: unknown;
  let ultimoWhatsAppInput: unknown;

  return {
    crearProcesarCaptacionEntrante: () => ({
      ejecutar: async (input) => {
        ultimaCaptacionInput = input;
        return resultadoExitoso(captacionProcesada);
      },
    }),
    crearProcesarWhatsAppWebhook: () => ({
      ejecutar: async (input) => {
        ultimoWhatsAppInput = input;
        return resultadoExitoso(captacionPendiente);
      },
    }),
    crearListarCaptacionesPendientes: () => ({
      ejecutar: async () => resultadoExitoso([captacionPendiente]),
    }),
    get ultimaCaptacionInput() {
      return ultimaCaptacionInput;
    },
    get ultimoWhatsAppInput() {
      return ultimoWhatsAppInput;
    },
  };
}

describe("http / integraciones routes", () => {
  it("registra captacion entrante sin levantar servidor real", async () => {
    const app = new Hono();
    const deps = crearDeps();
    app.route("/integraciones", crearIntegracionesRouter(deps));

    const res = await app.request("/integraciones/captaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        canal: "FORMULARIO_WEB",
        origen: "landing-alvas",
        nombre: "Ana Vendedora",
        telefono: "+59170000001",
        email: "ana@example.com",
        tipo: "VENTA",
        metadata: { zona: "Equipetrol" },
      }),
    });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual({
      success: true,
      message: "Captacion recibida y registrada",
      data: captacionProcesada,
    });
    expect(deps.ultimaCaptacionInput).toEqual({
      canal: "FORMULARIO_WEB",
      origen: "landing-alvas",
      nombre: "Ana Vendedora",
      telefono: "+59170000001",
      email: "ana@example.com",
      tipo: "VENTA",
      metadata: { zona: "Equipetrol" },
    });
  });

  it("rechaza webhook de WhatsApp con secreto invalido", async () => {
    const app = new Hono();
    app.route("/integraciones", crearIntegracionesRouter(crearDeps()));

    const res = await app.request(
      "/integraciones/webhooks/whatsapp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-integracion-secreto": "incorrecto",
        },
        body: JSON.stringify({ wa_id: "59170000002", wa_name: "Carlos Comprador" }),
      },
      {
        INTEGRACION_WHATSAPP_SECRETO: "secreto-correcto",
      },
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      success: false,
      message: "No autorizado",
      code: "WEBHOOK_SECRETO_INVALIDO",
    });
  });

  it("procesa webhook de WhatsApp autenticado por secreto", async () => {
    const app = new Hono();
    const deps = crearDeps();
    app.route("/integraciones", crearIntegracionesRouter(deps));

    const res = await app.request(
      "/integraciones/webhooks/whatsapp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-integracion-secreto": "secreto-correcto",
        },
        body: JSON.stringify({
          wa_id: "59170000002",
          wa_name: "Carlos Comprador",
          pregunta_tipo: "COMPRA",
          propiedad_id: "propiedad-1",
        }),
      },
      {
        INTEGRACION_WHATSAPP_SECRETO: "secreto-correcto",
      },
    );

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      success: true,
      message: "Captacion WhatsApp pendiente",
      data: captacionPendiente,
    });
    expect(deps.ultimoWhatsAppInput).toEqual({
      wa_id: "59170000002",
      wa_name: "Carlos Comprador",
      pregunta_tipo: "COMPRA",
      propiedad_id: "propiedad-1",
    });
  });

  it("lista captaciones pendientes para revision operativa", async () => {
    const app = new Hono();
    app.route("/integraciones", crearIntegracionesRouter(crearDeps()));

    const res = await app.request(
      "/integraciones/captaciones/pendientes",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: [captacionPendiente],
    });
  });

  it("protege la bandeja operativa de captaciones pendientes", async () => {
    const app = new Hono();
    app.onError((error, c) => {
      if (error instanceof ErrorDeDominio) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 401);
      }

      return c.json({ success: false, message: "Error interno del servidor." }, 500);
    });
    app.route("/integraciones", crearIntegracionesRouter(crearDeps()));

    const res = await app.request("/integraciones/captaciones/pendientes", undefined, envConAuth);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      success: false,
      message: "El auth token es invalido.",
      code: "AUTH_TOKEN_INVALIDO",
    });
  });

  it("serializa errores de dominio de captacion con codigo de negocio", async () => {
    const app = new Hono();
    app.route(
      "/integraciones",
      crearIntegracionesRouter({
        crearProcesarCaptacionEntrante: () => ({
          ejecutar: async () =>
            resultadoFallido(
              new ErrorDeDominio("Captacion duplicada", { codigo: "CAPTACION_DUPLICADA" }),
            ),
        }),
        crearProcesarWhatsAppWebhook: () => ({
          ejecutar: async () => resultadoExitoso(captacionPendiente),
        }),
        crearListarCaptacionesPendientes: () => ({
          ejecutar: async () => resultadoExitoso([]),
        }),
      }),
    );

    const res = await app.request("/integraciones/captaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      success: false,
      message: "Captacion duplicada",
      code: "CAPTACION_DUPLICADA",
    });
  });
});
