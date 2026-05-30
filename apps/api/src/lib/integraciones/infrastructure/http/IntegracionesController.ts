import { type Context } from "hono";
import {
  type IConvertirCaptacionPendiente,
  type IListarCaptacionesPendientes,
  type IMarcarCaptacionDuplicada,
  type IProcesarCaptacionEntrante,
  type IProcesarWhatsAppWebhook,
  type IRechazarCaptacionPendiente,
  type IRevisarCaptacionPendiente,
} from "../../application";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import { parseBody, ValidationError } from "../../../shared/infrastructure/validation/helpers";
import {
  CaptacionEntranteSchema,
  WhatsAppWebhookSchema,
  MarcarDuplicadaSchema,
  RechazarCaptacionSchema,
  ConvertirCaptacionSchema,
} from "../validation/schemas";

function comparacionSeguraConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let acum = 0;
  for (let i = 0; i < a.length; i++) {
    acum |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return acum === 0;
}

function obtenerIdCaptacion(c: ContextoIntegraciones): string {
  return c.req.param("idCaptacion") ?? "";
}

export type BindingsIntegraciones = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  INTEGRACION_WHATSAPP_SECRETO?: string;
};

export type IntegracionesRouterDeps = {
  crearProcesarWhatsAppWebhook: (c: ContextoIntegraciones) => IProcesarWhatsAppWebhook;
  crearProcesarCaptacionEntrante: (c: ContextoIntegraciones) => IProcesarCaptacionEntrante;
  crearListarCaptacionesPendientes: (c: ContextoIntegraciones) => IListarCaptacionesPendientes;
  crearRevisarCaptacionPendiente: (c: ContextoIntegraciones) => IRevisarCaptacionPendiente;
  crearMarcarCaptacionDuplicada: (c: ContextoIntegraciones) => IMarcarCaptacionDuplicada;
  crearRechazarCaptacionPendiente: (c: ContextoIntegraciones) => IRechazarCaptacionPendiente;
  crearConvertirCaptacionPendiente: (c: ContextoIntegraciones) => IConvertirCaptacionPendiente;
};

type ContextoIntegraciones = Context<{
  Bindings: BindingsIntegraciones;
  Variables: { authPayload: SessionClaims };
}>;

export class IntegracionesController {
  constructor(private readonly deps: IntegracionesRouterDeps) {}

  async recibirWhatsAppLead(c: ContextoIntegraciones): Promise<Response> {
    const secretoEsperado = c.env.INTEGRACION_WHATSAPP_SECRETO;
    if (secretoEsperado) {
      const secretoRecibido = c.req.header("x-integracion-secreto") ?? "";
      if (!comparacionSeguraConstante(secretoRecibido, secretoEsperado)) {
        return c.json(
          { success: false, message: "No autorizado", code: "WEBHOOK_SECRETO_INVALIDO" },
          401,
        );
      }
    }

    try {
      const body = parseBody(WhatsAppWebhookSchema, await c.req.json());
      const useCase = this.deps.crearProcesarWhatsAppWebhook(c);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json(
        { success: true, message: "Captacion WhatsApp pendiente", data: resultado.valor },
        201,
      );
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      console.error("IntegracionesController.recibirWhatsAppLead:", error);
      return c.json(
        { success: false, message: "Error procesando webhook", code: "WEBHOOK_ERROR_INTERNO" },
        500,
      );
    }
  }

  async listarCaptacionesPendientes(c: ContextoIntegraciones): Promise<Response> {
    try {
      const useCase = this.deps.crearListarCaptacionesPendientes(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      console.error("IntegracionesController.listarCaptacionesPendientes:", error);
      return c.json(
        { success: false, message: "Error listando captaciones", code: "CAPTACION_ERROR_INTERNO" },
        500,
      );
    }
  }

  async revisarCaptacionPendiente(c: ContextoIntegraciones): Promise<Response> {
    try {
      const useCase = this.deps.crearRevisarCaptacionPendiente(c);
      const resultado = await useCase.ejecutar({ idCaptacion: obtenerIdCaptacion(c) });

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json({ success: true, message: "Captacion revisada", data: resultado.valor });
    } catch (error) {
      console.error("IntegracionesController.revisarCaptacionPendiente:", error);
      return c.json(
        { success: false, message: "Error revisando captacion", code: "CAPTACION_ERROR_INTERNO" },
        500,
      );
    }
  }

  async marcarCaptacionDuplicada(c: ContextoIntegraciones): Promise<Response> {
    try {
      const body = parseBody(MarcarDuplicadaSchema, await c.req.json());
      const useCase = this.deps.crearMarcarCaptacionDuplicada(c);
      const resultado = await useCase.ejecutar({
        idCaptacion: obtenerIdCaptacion(c),
        razon: body.razon,
      });

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json({
        success: true,
        message: "Captacion marcada como duplicada",
        data: resultado.valor,
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      console.error("IntegracionesController.marcarCaptacionDuplicada:", error);
      return c.json(
        { success: false, message: "Error marcando captacion", code: "CAPTACION_ERROR_INTERNO" },
        500,
      );
    }
  }

  async rechazarCaptacionPendiente(c: ContextoIntegraciones): Promise<Response> {
    try {
      const body = parseBody(RechazarCaptacionSchema, await c.req.json());
      const useCase = this.deps.crearRechazarCaptacionPendiente(c);
      const resultado = await useCase.ejecutar({
        idCaptacion: obtenerIdCaptacion(c),
        razon: body.razon,
      });

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json({ success: true, message: "Captacion rechazada", data: resultado.valor });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      console.error("IntegracionesController.rechazarCaptacionPendiente:", error);
      return c.json(
        { success: false, message: "Error rechazando captacion", code: "CAPTACION_ERROR_INTERNO" },
        500,
      );
    }
  }

  async convertirCaptacionPendiente(c: ContextoIntegraciones): Promise<Response> {
    try {
      const body = parseBody(ConvertirCaptacionSchema, await c.req.json());
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearConvertirCaptacionPendiente(c);
      const resultado = await useCase.ejecutar({
        idCaptacion: obtenerIdCaptacion(c),
        idAsesor: authPayload.rol === "ADMIN" ? body.idAsesor : authPayload.idUsuario,
      });

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json({ success: true, message: "Captacion convertida", data: resultado.valor });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      console.error("IntegracionesController.convertirCaptacionPendiente:", error);
      return c.json(
        {
          success: false,
          message: "Error convirtiendo captacion",
          code: "CAPTACION_ERROR_INTERNO",
        },
        500,
      );
    }
  }

  async recibirCaptacion(c: ContextoIntegraciones): Promise<Response> {
    try {
      const body = parseBody(CaptacionEntranteSchema, await c.req.json());
      const useCase = this.deps.crearProcesarCaptacionEntrante(c);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json(
        { success: true, message: "Captacion recibida y registrada", data: resultado.valor },
        201,
      );
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      console.error("IntegracionesController.recibirCaptacion:", error);
      return c.json(
        { success: false, message: "Error procesando captacion", code: "CAPTACION_ERROR_INTERNO" },
        500,
      );
    }
  }
}
