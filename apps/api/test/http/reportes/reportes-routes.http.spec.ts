import { describe, expect, it } from "bun:test";
import { Hono } from "hono";

import { resultadoExitoso } from "../../../src/lib/shared";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";
import {
  crearReportesRouter,
  type ReportesRouterDeps,
} from "../../../src/lib/reportes/infrastructure";
import { crearAuthHeader, envConAuth } from "../helpers/auth";
import { crearTokenProviderDesdeEnv } from "../../../src/lib/auth/infrastructure/security/TokenProviderFactory";
import { verifySessionMiddleware, requireRolesMiddleware } from "../../../src/lib/shared/infrastructure";

const reporteGeneral = {
  fechaGeneracion: new Date("2026-05-23T10:00:00.000Z"),
  resumenAcciones: {
    acciones: [
      { evento: "LEAD_CREADO", total: 4 },
      { evento: "CITA_AGENDADA", total: 2 },
    ],
    totalAcciones: 6,
  },
  actividadReciente: [
    {
      idLead: "lead-1",
      evento: "CITA_AGENDADA",
      descripcion: "Cita comercial agendada",
      fecha: "2026-05-23T09:00:00.000Z",
    },
  ],
};

const estadisticasGlobales = {
  acciones: [
    { evento: "LEAD_CREADO", total: 4 },
    { evento: "CITA_AGENDADA", total: 2 },
  ],
  totalAcciones: 6,
};

function crearDeps(): ReportesRouterDeps {
  return {
    crearObtenerReporteGeneral: () => ({
      ejecutar: async () => resultadoExitoso(reporteGeneral),
    }),
    crearObtenerEstadisticasGlobales: () => ({
      ejecutar: async () => resultadoExitoso(estadisticasGlobales),
    }),
  };
}

function crearAppReportes(deps: ReportesRouterDeps) {
  const app = new Hono();
  app.use("/reportes", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
  app.use("/reportes/*", verifySessionMiddleware((env) => crearTokenProviderDesdeEnv(env)));
  app.use("/reportes", requireRolesMiddleware(["ADMIN"]));
  app.use("/reportes/*", requireRolesMiddleware(["ADMIN"]));
  app.route("/reportes", crearReportesRouter(deps));
  app.onError((error, c) => {
    if (error instanceof ErrorDeDominio) {
      const status =
        error.codigo === "AUTH_TOKEN_INVALIDO"
          ? 401
          : error.codigo === "ROL_NO_PERMITIDO"
            ? 403
            : 400;

      return c.json(
        {
          success: false,
          message: error.message,
          code: error.codigo,
        },
        status,
      );
    }

    return c.json({ success: false, message: "Error interno" }, 500);
  });

  return app;
}

describe("http / reportes routes", () => {
  it("rechaza reportes sin sesion", async () => {
    const app = crearAppReportes(crearDeps());

    const res = await app.request("/reportes/general", undefined, envConAuth);

    expect(res.status).toBe(401);
  });

  it("rechaza reportes para asesor", async () => {
    const app = crearAppReportes(crearDeps());

    const res = await app.request(
      "/reportes/general",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(403);
  });

  it("devuelve reporte general para admin con fecha serializada", async () => {
    const app = crearAppReportes(crearDeps());

    const res = await app.request(
      "/reportes/general",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: {
        ...reporteGeneral,
        fechaGeneracion: "2026-05-23T10:00:00.000Z",
      },
    });
  });

  it("devuelve estadisticas globales para admin", async () => {
    const app = crearAppReportes(crearDeps());

    const res = await app.request(
      "/reportes/estadisticas-globales",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: estadisticasGlobales,
    });
  });
});
