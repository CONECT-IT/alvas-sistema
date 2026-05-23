import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { crearPropiedadRouter } from "../../../src/lib/propiedades/infrastructure";
import { Propiedad } from "../../../src/lib/propiedades/domain/entities/Propiedad";
import { resultadoExitoso, resultadoFallido } from "../../../src/lib/shared/application/Resultado";
import type { PropiedadRouterDeps } from "../../../src/lib/propiedades/infrastructure/http/PropiedadRouter";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";
import { crearAuthHeader, envConAuth } from "../helpers/auth";

type PropiedadesEntradasCapturadas = {
  crearPropiedad: unknown[];
  actualizarPropiedad: unknown[];
  eliminarPropiedad: unknown[];
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
  };
}

describe("http / propiedades routes", () => {
  it("lista propiedades autenticadas y permite filtrar por lead vendedor", async () => {
    const app = new Hono();
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
    const app = new Hono();
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
    const app = new Hono();
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

  it("responde 403 cuando el use case rechaza permisos de propiedad", async () => {
    const app = new Hono();
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
    const app = new Hono();
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
});
