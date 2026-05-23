import { HmacTokenProvider } from "../../../src/lib/auth/infrastructure/security/HmacTokenProvider";

const AUTH_SECRET_TEST = "test-secret-with-enough-entropy";

export const envConAuth = {
  AUTH_SECRET: AUTH_SECRET_TEST,
};

export async function crearAuthHeader(
  params: {
    idUsuario?: string;
    rol?: "ADMIN" | "ASESOR";
  } = {},
): Promise<string> {
  const provider = new HmacTokenProvider({ authSecret: AUTH_SECRET_TEST });
  const token = await provider.generarAuthToken({
    idUsuario: params.idUsuario ?? "usuario-1",
    rol: params.rol ?? "ADMIN",
  });

  return `Bearer ${token.valor}`;
}
