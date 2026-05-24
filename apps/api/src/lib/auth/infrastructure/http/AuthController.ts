import { type Context } from "hono";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { type IIniciarSesion, type IRenovarSesion } from "../../application";
import {
  parseBody,
  esValidationError,
  formatearValidacion,
} from "../../../shared/infrastructure/validation/helpers";
import { IniciarSesionSchema, RenovarSesionSchema } from "../validation/schemas";

export type BindingsAuth = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
};

export type AuthControllerDeps = Readonly<{
  crearIniciarSesion: (c: ContextoAuth) => IIniciarSesion;
  crearRenovarSesion: (c: ContextoAuth) => IRenovarSesion;
}>;

type ContextoAuth = Context<{ Bindings: BindingsAuth }>;

export class AuthController {
  constructor(private readonly deps: AuthControllerDeps) {}

  async iniciarSesion(c: ContextoAuth): Promise<Response> {
    try {
      const body = parseBody(IniciarSesionSchema, await c.req.json());
      const useCase = this.deps.crearIniciarSesion(c);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return c.json(
          {
            success: false,
            message: resultado.error.message,
            code: resultado.error.codigo,
          },
          401,
        );
      }

      return c.json({
        success: true,
        data: resultado.valor,
      });
    } catch (error) {
      if (esValidationError(error)) {
        return c.json(formatearValidacion(error), 400);
      }
      console.error("Error inesperado en AuthController.iniciarSesion:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
        },
        500,
      );
    }
  }

  async renovarSesion(c: ContextoAuth): Promise<Response> {
    try {
      const body = parseBody(RenovarSesionSchema, await c.req.json());
      const useCase = this.deps.crearRenovarSesion(c);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return c.json(
          {
            success: false,
            message: resultado.error.message,
            code: resultado.error.codigo,
          },
          401,
        );
      }

      return c.json({
        success: true,
        data: resultado.valor,
      });
    } catch (error) {
      if (esValidationError(error)) {
        return c.json(formatearValidacion(error), 400);
      }
      console.error("Error inesperado en AuthController.renovarSesion:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
        },
        500,
      );
    }
  }
}
