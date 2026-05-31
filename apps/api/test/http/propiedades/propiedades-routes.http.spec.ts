import { describe, expect, it, beforeAll, afterAll } from "bun:test";

const originalError = globalThis.console.error;
const originalWarn = globalThis.console.warn;

beforeAll(() => {
  globalThis.console.error = () => {};
  globalThis.console.warn = () => {};
});

afterAll(() => {
  globalThis.console.error = originalError;
  globalThis.console.warn = originalWarn;
});
import { Hono } from "hono";
import { crearPropiedadRouter } from "../../../src/lib/propiedades/infrastructure";
import { Propiedad } from "../../../src/lib/propiedades/domain/entities/Propiedad";
import { resultadoExitoso, resultadoFallido } from "../../../src/lib/shared/application/Resultado";
import type { PropiedadRouterDeps } from "../../../src/lib/propiedades/infrastructure/http/PropiedadRouter";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";
import { ValidationError } from "../../../src/lib/shared/infrastructure/validation/helpers";
import { mapErrorDeDominioAStatus } from "../../../src/lib/shared/infrastructure/http/responses";
import { crearAuthHeader, envConAuth } from "../helpers/auth";
import { crearTokenProviderDesdeEnv } from "../../../src/lib/auth/infrastructure/security/TokenProviderFactory";
import { verifySessionMiddleware } from "../../../src/lib/shared/infrastructure";


function conManejadorError(app: Hono): Hono {
  app.onError((error, c) => {
    if (error instanceof ErrorDeDominio) {
      return c.json(
        { success: false, message: error.message, code: error.codigo },
        mapErrorDeDominioAStatus(error) as Parameters<typeof c.json>[1],
      );
    }
    if (error instanceof ValidationError) {
      return c.json(
        {
          success: false,
          message: "Error de validación",
          code: "VALIDATION_ERROR",
          detalles: error.details,
        },
        400,
      );
    }
    console.error("Error no manejado:", error);
    return c.json(
      { success: false, message: "Error interno del servidor.", code: "ERROR_INTERNO" },
      500,
    );
  });
  return app;
}

type PropiedadesEntradasCapturadas = {
  crearPropiedad: unknown[];
  actualizarPropiedad: unknown[];
  eliminarPropiedad: unknown[];
  obtenerPropiedad: unknown[];
};

function crearDeps(
  capturadas: PropiedadesEntradasCapturadas = crearCapturadas(),
): PropiedadRouterDeps {
  const propiedadDisponible = Propiedad.crear({
    id: "propiedad-1",
    titulo: "Casa disponible",
    descripcion: "Casa de cliente vendedor con contrato",
    precio: 120000,
    estado: "DISPONIBLE",
    idLeadOrigen: "lead-1",
  });
  const propiedadPreliminar = Propiedad.crear({
    id: "propiedad-2",
    titulo: "Apartamento borrador",
    descripcion: "Captacion aun no disponible",
    precio: 90000,
    estado: "BORRADOR",
    idLeadOrigen: "lead-2",
  });

  const propiedades = [propiedadDisponible, propiedadPreliminar];

  return {
    autorizador: {
      puedeVerPropiedades: () => true,
      puedeGestionarPropiedades: () => true,
      puedeEditarPropiedadRelacionada: () => true,
    },
    controllerDeps: {
      crearCrearPropiedad: () => ({
        ejecutar: async (input: unknown) => {
          capturadas.crearPropiedad.push(input);
          return resultadoExitoso(propiedadDisponible);
        },
      }),
      crearListarPropiedades: () => ({
        ejecutar: async () => resultadoExitoso(propiedades),
      }),
      crearActualizarPropiedad: () => ({
        ejecutar: async (input: unknown) => {
          capturadas.actualizarPropiedad.push(input);
          return resultadoExitoso(undefined);
        },
      }),
      crearObtenerPropiedad: () => ({
        ejecutar: async (input: unknown) => {
          capturadas.obtenerPropiedad.push(input);
          const id = (input as { idPropiedad: string }).idPropiedad;
          const p = propiedades.find((x) => x.id === id);
          return p
            ? resultadoExitoso(p)
            : resultadoFallido(
                new ErrorDeDominio("Propiedad no encontrada.", { codigo: "PROPIEDAD_NO_ENCONTRADA" }),
              );
        },
      }),
      crearEliminarPropiedad: () => ({
        ejecutar: async (input: unknown) => {
          capturadas.eliminarPropiedad.push(input);
          return resultadoExitoso(undefined);
        },
      }),
    },
  };
}

function crearDepsSinPermisos(): PropiedadRouterDeps {
  const deps = crearDeps();
  return {
    ...deps,
    controllerDeps: {
      ...deps.controllerDeps,
      crearActualizarPropiedad: () => ({
        ejecutar: async () =>
          resultadoFallido(
            new ErrorDeDominio("El asesor no puede actualizar esta propiedad.", {
              codigo: "SIN_PERMISOS_PROPIEDAD",
            }),
          ),
      }),
    },
  };
}

function crearCapturadas(): PropiedadesEntradasCapturadas {
  return {
    crearPropiedad: [],
    actualizarPropiedad: [],
    eliminarPropiedad: [],
    obtenerPropiedad: [],
  };
}

describe("http / propiedades routes", () => {
  it("lista propiedades autenticadas y permite filtrar por lead vendedor", async () => {
    const app = conManejadorError(new Hono());
    app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(crearDeps()));

    const res = await app.request(
      "/propiedades?leadId=lead-1",
      {
        headers: {
          Authorization: await crearAuthHeader({ rol: "ASESOR" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: [
        expect.objectContaining({
          id: "propiedad-1",
          titulo: "Casa disponible",
          estado: "DISPONIBLE",
          idLeadOrigen: "lead-1",
        }),
      ],
    });
  });

  it("crea propiedad con usuario autenticado del adapter HTTP", async () => {
    const capturadas = crearCapturadas();
    const app = conManejadorError(new Hono());
    app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(crearDeps(capturadas)));

    const res = await app.request(
      "/propiedades",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: "Casa captada",
          descripcion: "Propiedad de lead vendedor",
          precio: 125000,
          estado: "BORRADOR",
          idLeadOrigen: "lead-1",
        }),
      },
      envConAuth,
    );

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true, data: { id: "propiedad-1" } });
    expect(capturadas.crearPropiedad[0]).toEqual(
      expect.objectContaining({
        titulo: "Casa captada",
        estado: "BORRADOR",
        idLeadOrigen: "lead-1",
        usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
      }),
    );
  });

  it("actualiza propiedad pasando id de ruta y usuario autenticado", async () => {
    const capturadas = crearCapturadas();
    const app = conManejadorError(new Hono());
    app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(crearDeps(capturadas)));

    const res = await app.request(
      "/propiedades/propiedad-1",
      {
        method: "PUT",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          precio: 130000,
          estado: "DISPONIBLE",
        }),
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: "Propiedad actualizada" });
    expect(capturadas.actualizarPropiedad[0]).toEqual(
      expect.objectContaining({
        idPropiedad: "propiedad-1",
        precio: 130000,
        estado: "DISPONIBLE",
        usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
      }),
    );
  });

  it("actualiza propiedad a vendida o archivada preservando estado comercial cerrado", async () => {
    const estadosCerrados = ["VENDIDA", "ARCHIVADA"] as const;

    for (const estado of estadosCerrados) {
      const capturadas = crearCapturadas();
      const app = new Hono();
      app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
      app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
      app.route("/propiedades", crearPropiedadRouter(crearDeps(capturadas)));

      const res = await app.request(
        `/propiedades/propiedad-${estado.toLowerCase()}`,
        {
          method: "PUT",
          headers: {
            Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado }),
        },
        envConAuth,
      );

      expect(res.status).toBe(200);
      expect(capturadas.actualizarPropiedad[0]).toEqual(
        expect.objectContaining({
          idPropiedad: `propiedad-${estado.toLowerCase()}`,
          estado,
          usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
        }),
      );
    }
  });

  it("responde 403 cuando el use case rechaza permisos de propiedad", async () => {
    const app = conManejadorError(new Hono());
    app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(crearDepsSinPermisos()));

    const res = await app.request(
      "/propiedades/propiedad-ajena",
      {
        method: "PUT",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ precio: 140000 }),
      },
      envConAuth,
    );

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      success: false,
      message: "El asesor no puede actualizar esta propiedad.",
      code: "SIN_PERMISOS_PROPIEDAD",
    });
  });

  it("elimina propiedad desde ruta autenticada", async () => {
    const capturadas = crearCapturadas();
    const app = conManejadorError(new Hono());
    app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(crearDeps(capturadas)));

    const res = await app.request(
      "/propiedades/propiedad-1",
      {
        method: "DELETE",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: "Propiedad eliminada" });
    expect(capturadas.eliminarPropiedad[0]).toEqual({
      idPropiedad: "propiedad-1",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });
  });

  it("lista todas las propiedades sin filtro", async () => {
    const app = conManejadorError(new Hono());
    app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(crearDeps()));

    const res = await app.request(
      "/propiedades",
      {
        headers: {
          Authorization: await crearAuthHeader({ rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toMatchObject({ id: "propiedad-1", estado: "DISPONIBLE" });
    expect(body.data[1]).toMatchObject({ id: "propiedad-2", estado: "BORRADOR" });
  });

  it("responde error si la propiedad a actualizar no existe", async () => {
    const deps = crearDeps();
    const conError = {
      ...deps,
      controllerDeps: {
        ...deps.controllerDeps,
        crearActualizarPropiedad: () => ({
          ejecutar: async () =>
            resultadoFallido(
              new ErrorDeDominio("Propiedad no encontrada.", { codigo: "PROPIEDAD_NO_ENCONTRADA" }),
            ),
        }),
      },
    };
    const app = new Hono();
      app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
      app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(conError));

    const res = await app.request(
      "/propiedades/propiedad-inexistente",
      {
        method: "PUT",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ precio: 99999 }),
      },
      envConAuth,
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      message: "Propiedad no encontrada.",
      code: "PROPIEDAD_NO_ENCONTRADA",
    });
  });

  it("responde error si la propiedad a eliminar no existe", async () => {
    const deps = crearDeps();
    const conError = {
      ...deps,
      controllerDeps: {
        ...deps.controllerDeps,
        crearEliminarPropiedad: () => ({
          ejecutar: async () =>
            resultadoFallido(
              new ErrorDeDominio("Propiedad no encontrada.", { codigo: "PROPIEDAD_NO_ENCONTRADA" }),
            ),
        }),
      },
    };
    const app = new Hono();
      app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
      app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(conError));

    const res = await app.request(
      "/propiedades/propiedad-inexistente",
      {
        method: "DELETE",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      message: "Propiedad no encontrada.",
      code: "PROPIEDAD_NO_ENCONTRADA",
    });
  });

  it("rechaza crear propiedad con body invalido (precio negativo)", async () => {
    const app = conManejadorError(new Hono());
    app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(crearDeps()));

    const res = await app.request(
      "/propiedades",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: "Casa",
          descripcion: "Test",
          precio: -100,
        }),
      },
      envConAuth,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("rechaza actualizar propiedad con body invalido (precio cero)", async () => {
    const app = conManejadorError(new Hono());
    app.use("/propiedades", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.use("/propiedades/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
    app.route("/propiedades", crearPropiedadRouter(crearDeps()));

    const res = await app.request(
      "/propiedades/propiedad-1",
      {
        method: "PUT",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ precio: 0 }),
      },
      envConAuth,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe("VALIDATION_ERROR");
  });
});
