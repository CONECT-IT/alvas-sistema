import { describe, expect, it } from "bun:test";
import { Hono } from "hono";

import { resultadoExitoso, resultadoFallido } from "../../../src/lib/shared";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";
import {
  crearIntegracionesRouter,
  type IntegracionesRouterDeps,
} from "../../../src/lib/integraciones/infrastructure";

const captacionProcesada = {
  idLead: "lead-captacion-1",
  idPropiedadPreliminar: "propiedad-preliminar-1",
};

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
        return resultadoExitoso(captacionProcesada);
      },
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
      message: "Lead recibido y asignado",
      data: captacionProcesada,
    });
    expect(deps.ultimoWhatsAppInput).toEqual({
      wa_id: "59170000002",
      wa_name: "Carlos Comprador",
      pregunta_tipo: "COMPRA",
      propiedad_id: "propiedad-1",
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
          ejecutar: async () => resultadoExitoso(captacionProcesada),
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
