import { type Context } from "hono";
import { ErrorDeDominio } from "../../domain";

export function responderErrorDeDominio(
  c: Context,
  error: ErrorDeDominio,
  status: 400 | 401 | 403 | 404 | 409 = 400,
): Response {
  const statusFinal: 400 | 401 | 403 | 404 | 409 =
    error.codigo === "ROL_NO_PERMITIDO" || error.codigo.startsWith("SIN_PERMISOS")
      ? 403
      : error.codigo.includes("NOT_FOUND") || error.codigo.includes("NO_ENCONTRADO")
        ? 404
        : status;

  if (statusFinal === 403) {
    const authPayload = c.get("authPayload");
    console.warn(
      `Acceso denegado: usuario=${authPayload?.idUsuario}, rol=${authPayload?.rol}, codigo=${error.codigo}, mensaje=${error.message}`,
    );
  }

  return c.json({ success: false, message: error.message, code: error.codigo }, statusFinal);
}

export function responderErrorInterno(c: Context, contexto: string, error: unknown): Response {
  console.error(`${contexto}:`, error);

  return c.json({ success: false, message: "Error interno", code: "ERROR_INTERNO" }, 500);
}
