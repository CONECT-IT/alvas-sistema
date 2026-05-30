import { type MiddlewareHandler } from "hono";
import { ErrorDeDominio } from "../../domain";
import { type SessionClaims } from "./SessionClaims";
import { type D1DatabaseLike } from "../persistence/D1DatabaseLike";

type SessionEnvBindings = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
};

type SessionEnv = {
  Bindings: SessionEnvBindings;
  Variables: {
    authPayload: SessionClaims;
  };
};

export const verifySessionMiddleware = (
  createTokenProvider: (bindings: SessionEnvBindings) => {
    validarAuthToken(token: string): Promise<SessionClaims> | SessionClaims;
  },
): MiddlewareHandler<SessionEnv> => {
  return async (c, next) => {
    const authHeader = c.req.header("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) {
      throw new ErrorDeDominio("El auth token es invalido.", { codigo: "AUTH_TOKEN_INVALIDO" });
    }

    const tokenProvider = createTokenProvider(c.env);
    const payload = await tokenProvider.validarAuthToken(token);

    const usuarioActivo = await usuarioEstaActivo(c.env.DB, payload.idUsuario);
    if (!usuarioActivo) {
      throw new ErrorDeDominio("El auth token es invalido.", { codigo: "AUTH_TOKEN_INVALIDO" });
    }

    c.set("authPayload", payload);
    await next();
  };
};

async function usuarioEstaActivo(db: D1DatabaseLike, idUsuario: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT estado FROM usuarios WHERE id = ?")
    .bind(idUsuario)
    .first<{ estado: string }>();

  return row?.estado === "ACTIVO";
}

export const requireRolesMiddleware = <T extends { Variables: { authPayload: SessionClaims } }>(
  rolesPermitidos: SessionClaims["rol"][],
): MiddlewareHandler<T> => {
  return async (c, next) => {
    const payload = c.get("authPayload");

    if (!rolesPermitidos.includes(payload.rol)) {
      throw new ErrorDeDominio("No tienes permisos para ejecutar esta accion.", {
        codigo: "ROL_NO_PERMITIDO",
      });
    }

    await next();
  };
};
