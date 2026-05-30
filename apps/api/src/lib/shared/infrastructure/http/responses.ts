import { type Context } from "hono";
import { ErrorDeDominio } from "../../domain";

export function mapErrorDeDominioAStatus(error: ErrorDeDominio): number {
  if (error.codigo === "USUARIO_YA_EXISTE") return 409;
  if (
    error.codigo === "AUTH_TOKEN_INVALIDO" ||
    error.codigo === "REFRESH_TOKEN_INVALIDO" ||
    error.codigo === "CREDENCIALES_INVALIDAS"
  )
    return 401;
  if (error.codigo === "ROL_NO_PERMITIDO" || error.codigo.startsWith("SIN_PERMISOS")) return 403;
  if (
    error.codigo.includes("NOT_FOUND") ||
    error.codigo.includes("NO_ENCONTRADO") ||
    error.codigo.includes("NO_ENCONTRADA")
  )
    return 404;
  return 400;
}

export function responderErrorDeDominio(c: Context, error: ErrorDeDominio): Response {
  const status = mapErrorDeDominioAStatus(error);

  if (status === 403) {
    const authPayload = c.get("authPayload");
    console.warn(
      `Acceso denegado: usuario=${authPayload?.idUsuario}, rol=${authPayload?.rol}, codigo=${error.codigo}, mensaje=${error.message}`,
    );
  }

  return c.json(
    { success: false, message: error.message, code: error.codigo },
    status as Parameters<typeof c.json>[1],
  );
}

export function responderErrorInterno(c: Context, contexto: string, error: unknown): never {
  console.error(`${contexto}:`, error);
  throw error;
}
