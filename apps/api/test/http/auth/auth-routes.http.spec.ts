import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { crearAuthRouter } from "../../../src/lib/auth/infrastructure";
import { resultadoExitoso, resultadoFallido } from "../../../src/lib/shared/application/Resultado";
import { ErrorDeDominio } from "../../../src/lib/shared/domain/errors/ErrorDeDominio";
import type { AuthControllerDeps } from "../../../src/lib/auth/infrastructure";

const sesionExitosa = {
  authToken: "auth-token",
  refreshToken: "refresh-token",
  usuario: {
    id: "usuario-1",
    username: "admin",
    rol: "ADMIN" as const,
  },
};

describe("http / auth routes", () => {
  it("responde 200 y serializa la sesion cuando login es valido", async () => {
    const app = new Hono();
    const deps: AuthControllerDeps = {
      crearIniciarSesion: () => ({
        ejecutar: async () => resultadoExitoso(sesionExitosa),
      }),
      crearRenovarSesion: () => ({
        ejecutar: async () => resultadoExitoso(sesionExitosa),
      }),
    };
    app.route("/auth", crearAuthRouter(deps));

    const res = await app.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", clave: "correcta" }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: sesionExitosa,
    });
  });

  it("responde 401 y codigo de dominio cuando login falla", async () => {
    const app = new Hono();
    const deps: AuthControllerDeps = {
      crearIniciarSesion: () => ({
        ejecutar: async () =>
          resultadoFallido(
            new ErrorDeDominio("Credenciales invalidas", {
              codigo: "CREDENCIALES_INVALIDAS",
            }),
          ),
      }),
      crearRenovarSesion: () => ({
        ejecutar: async () => resultadoExitoso(sesionExitosa),
      }),
    };
    app.route("/auth", crearAuthRouter(deps));

    const res = await app.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", clave: "incorrecta" }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      success: false,
      message: "Credenciales invalidas",
      code: "CREDENCIALES_INVALIDAS",
    });
  });
});
