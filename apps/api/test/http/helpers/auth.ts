import { HmacTokenProvider } from "../../../src/lib/auth/infrastructure/security/HmacTokenProvider";
import { type D1DatabaseLike, type D1StatementLike } from "../../../src/lib/shared/infrastructure";

const AUTH_SECRET_TEST = "test-secret-with-enough-entropy";

type EstadoUsuarioPrueba = "ACTIVO" | "DESHABILITADO";

class FakeUsuarioStatement implements D1StatementLike {
  private idUsuario = "";

  constructor(private readonly estados: Map<string, EstadoUsuarioPrueba>) {}

  bind(...values: unknown[]): D1StatementLike {
    this.idUsuario = String(values[0] ?? "");
    return this;
  }

  async first<TRow = unknown>(): Promise<TRow | null> {
    const estado = this.estados.get(this.idUsuario);
    if (!estado) return null;

    return { estado } as TRow;
  }

  async run() {
    return { success: true };
  }

  async all<TRow = unknown>() {
    return { results: [] as TRow[] };
  }
}

function crearDbUsuarios(estados: Record<string, EstadoUsuarioPrueba>): D1DatabaseLike {
  const estadoPorUsuario = new Map(Object.entries(estados));

  return {
    prepare() {
      return new FakeUsuarioStatement(estadoPorUsuario);
    },
    async exec() {
      return undefined;
    },
  };
}

export function crearEnvConAuth(
  estados: Record<string, EstadoUsuarioPrueba> = {
    "usuario-1": "ACTIVO",
    "admin-1": "ACTIVO",
    "asesor-1": "ACTIVO",
  },
) {
  return {
    AUTH_SECRET: AUTH_SECRET_TEST,
    DB: crearDbUsuarios(estados),
  };
}

export const envConAuth = crearEnvConAuth();

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

  return `Bearer ${token}`;
}
