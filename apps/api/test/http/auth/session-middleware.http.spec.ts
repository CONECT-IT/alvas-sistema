import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";
import { verifySessionMiddleware } from "../../../src/lib/shared/infrastructure";
import { crearTokenProviderDesdeEnv } from "../../../src/lib/auth/infrastructure/security/TokenProviderFactory";
import { crearAuthHeader, crearEnvConAuth } from "../helpers/auth";

describe("http / session middleware", () => {
  it("rechaza tokens validos cuando el usuario fue deshabilitado", async () => {
    const app = new Hono();
    app.use("/protegida", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.get("/protegida", (c) => c.json({ success: true }));
    app.onError((error, c) => {
      if (error instanceof ErrorDeDominio) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 401);
      }

      return c.json({ success: false, message: "Error interno" }, 500);
    });

    const res = await app.request(
      "/protegida",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
        },
      },
      crearEnvConAuth({ "asesor-1": "DESHABILITADO" }),
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      success: false,
      message: "El auth token es invalido.",
      code: "AUTH_TOKEN_INVALIDO",
    });
  });
});
