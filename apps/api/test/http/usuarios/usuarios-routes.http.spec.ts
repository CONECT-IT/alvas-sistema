import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { crearUsuarioRouter } from "../../../src/lib/usuarios/infrastructure";
import { resultadoExitoso } from "../../../src/lib/shared/application/Resultado";
import type { UsuarioControllerDeps } from "../../../src/lib/usuarios/infrastructure";

const usuarioRespuesta = {
  id: "usuario-1",
  username: "asesor",
  nombre: "Asesor Uno",
  rol: "ASESOR",
  estado: "ACTIVO",
  creadoEn: "2026-05-23T00:00:00.000Z",
  actualizadoEn: "2026-05-23T00:00:00.000Z",
};

function crearDeps(): UsuarioControllerDeps & { readonly ultimoActualizarInput: unknown } {
  let ultimoActualizarInput: unknown;

  return {
    crearCrearUsuario: () => ({
      ejecutar: async () =>
        resultadoExitoso({
          id: { valor: "usuario-1" },
          username: { valor: "asesor" },
          nombre: { valor: "Asesor Uno" },
          rol: { valor: "ASESOR" },
          estado: { valor: "ACTIVO" },
        } as never),
    }),
    crearListarUsuarios: () => ({
      ejecutar: async () => resultadoExitoso([usuarioRespuesta]),
    }),
    crearObtenerUsuario: () => ({
      ejecutar: async () => resultadoExitoso(usuarioRespuesta),
    }),
    crearActualizarUsuario: () => ({
      ejecutar: async (input: unknown) => {
        ultimoActualizarInput = input;
        return resultadoExitoso({
          ...usuarioRespuesta,
          nombre: "Asesor Actualizado",
        });
      },
    }),
    get ultimoActualizarInput() {
      return ultimoActualizarInput;
    },
  };
}

describe("http / usuarios routes", () => {
  it("lista usuarios con contrato serializado sin exponer hashClave", async () => {
    const app = new Hono();
    app.route("/usuarios", crearUsuarioRouter(crearDeps()));

    const res = await app.request("/usuarios");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: [usuarioRespuesta],
    });
    expect(JSON.stringify(body)).not.toContain("hashClave");
  });

  it("obtiene un usuario por id desde el adaptador HTTP", async () => {
    const app = new Hono();
    app.route("/usuarios", crearUsuarioRouter(crearDeps()));

    const res = await app.request("/usuarios/usuario-1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: usuarioRespuesta,
    });
  });

  it("envia username y clave al caso de uso sin serializar datos sensibles", async () => {
    const app = new Hono();
    const deps = crearDeps();
    app.route("/usuarios", crearUsuarioRouter(deps));

    const res = await app.request("/usuarios/usuario-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "asesor2", clave: "nueva-clave" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect((deps as { ultimoActualizarInput?: unknown }).ultimoActualizarInput).toEqual({
      idUsuario: "usuario-1",
      username: "asesor2",
      nombre: undefined,
      clave: "nueva-clave",
      rol: undefined,
    });
    expect(JSON.stringify(body)).not.toContain("nueva-clave");
    expect(JSON.stringify(body)).not.toContain("hashClave");
  });
});
