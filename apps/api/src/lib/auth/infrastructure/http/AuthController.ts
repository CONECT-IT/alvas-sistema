import { type Context } from "hono";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { type IIniciarSesion, type IRenovarSesion } from "../../application";
import { parseBody } from "../../../shared/infrastructure/validation/helpers";
import {
  responderErrorDeDominio,
  responderErrorInterno,
} from "../../../shared/infrastructure/http/responses";
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
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "AuthController.iniciarSesion:", error);
    }
  }

  async renovarSesion(c: ContextoAuth): Promise<Response> {
    try {
      const body = parseBody(RenovarSesionSchema, await c.req.json());
      const useCase = this.deps.crearRenovarSesion(c);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return responderErrorDeDominio(c, resultado.error);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      return responderErrorInterno(c, "AuthController.renovarSesion:", error);
    }
  }
}
