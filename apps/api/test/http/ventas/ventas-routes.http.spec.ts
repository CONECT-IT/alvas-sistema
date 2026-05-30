import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { crearVentasRouter } from "../../../src/lib/ventas/infrastructure";
import { resultadoExitoso, resultadoFallido } from "../../../src/lib/shared/application/Resultado";
import type { VentasControllerDeps } from "../../../src/lib/ventas/infrastructure";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";
import { crearAuthHeader, envConAuth } from "../helpers/auth";

type VentasEntradasCapturadas = {
  registrarLead: unknown[];
  actualizarLead: unknown[];
  agendarCita: unknown[];
  crearContrato: unknown[];
  firmarContrato: unknown[];
  asignarLead: unknown[];
};

function crearDeps(capturadas: VentasEntradasCapturadas = crearCapturadas()): VentasControllerDeps {
  const lead = {
    id: "lead-1",
    nombre: "Ana Vendedora",
    email: "ana@example.com",
    telefono: "999",
    estado: { valor: "NUEVO" },
    tipo: { valor: "VENTA" },
    idAsesor: "usuario-1",
    idCliente: undefined,
    idPropiedadInteres: "propiedad-1",
    citas: [
      {
        id: "cita-1",
        idLead: "lead-1",
        idPropiedad: "propiedad-1",
        fechaInicio: new Date("2026-06-01T14:00:00.000Z"),
        fechaFin: new Date("2026-06-01T15:00:00.000Z"),
        estado: { valor: "PENDIENTE" },
        observacion: "Visita a propiedad",
      },
    ],
    creadoEn: new Date("2026-05-01T10:00:00.000Z"),
    actualizadoEn: new Date("2026-05-02T10:00:00.000Z"),
  };

  return {
    crearRegistrarLead: () => ({
      ejecutar: async (input: unknown) => {
        capturadas.registrarLead.push(input);
        return resultadoExitoso({ id: "lead-1" });
      },
    }),
    crearAgendarCita: () => ({
      ejecutar: async (input: unknown) => {
        capturadas.agendarCita.push(input);
        return resultadoExitoso(undefined);
      },
    }),
    crearRegistrarClienteDirecto: () => ({
      ejecutar: async () => resultadoExitoso({ id: "cliente-1" }),
    }),
    crearConvertirLeadACliente: () => ({ ejecutar: async () => resultadoExitoso("cliente-1") }),
    crearActualizarLead: () => ({
      ejecutar: async (input: unknown) => {
        capturadas.actualizarLead.push(input);
        return resultadoExitoso(lead);
      },
    }),
    crearActualizarCita: () => ({ ejecutar: async () => resultadoExitoso(undefined) }),
    crearListarLeadsPorAsesor: () => ({ ejecutar: async () => resultadoExitoso([lead]) }),
    crearListarClientes: () => ({ ejecutar: async () => resultadoExitoso([]) }),
    crearObtenerLead: () => ({ ejecutar: async () => resultadoExitoso(lead) }),
    crearListarLeads: () => ({ ejecutar: async () => resultadoExitoso([lead]) }),
    crearAsignarLeadAAsesor: () => ({
      ejecutar: async (input: unknown) => {
        capturadas.asignarLead.push(input);
        return resultadoExitoso(undefined);
      },
    }),
    crearListarAsesoresConLeads: () => ({ ejecutar: async () => resultadoExitoso([]) }),
    crearListarCitas: () => ({ ejecutar: async () => resultadoExitoso([]) }),
    crearObtenerCitaPorId: () => ({ ejecutar: async () => resultadoExitoso(undefined) }),
    crearObtenerCliente: () => ({ ejecutar: async () => resultadoExitoso(undefined) }),
    crearActualizarCliente: () => ({ ejecutar: async () => resultadoExitoso(undefined) }),
    crearListarPropiedadesPorCliente: () => ({ ejecutar: async () => resultadoExitoso([]) }),
    crearCrearContrato: () => ({
      ejecutar: async (input: unknown) => {
        capturadas.crearContrato.push(input);
        return resultadoExitoso({
          id: "contrato-1",
          idLead: "lead-1",
          idPropiedad: "propiedad-1",
          estado: "BORRADOR",
        });
      },
    }),
    crearListarContratos: () => ({ ejecutar: async () => resultadoExitoso([]) }),
    crearListarContratosPorAsesor: () => ({ ejecutar: async () => resultadoExitoso([]) }),
    crearFirmarContrato: () => ({
      ejecutar: async (input: unknown) => {
        capturadas.firmarContrato.push(input);
        return resultadoExitoso(undefined);
      },
    }),
    crearCancelarContrato: () => ({ ejecutar: async () => resultadoExitoso(undefined) }),
    crearListarActividadLead: () => ({ ejecutar: async () => resultadoExitoso([]) }),
    crearListarPipeline: () => ({
      ejecutar: async () =>
        resultadoExitoso([
          {
            id: "lead-1",
            nombre: "Ana Vendedora",
            estado: "NUEVO",
            tipo: "VENTA",
            idAsesor: "usuario-1",
            nombreAsesor: "Luis Asesor",
            citasCount: 0,
            citas: [],
          },
        ]),
    }),
    crearVentasRepo: () => ({}) as never,
    crearPropiedadRepo: () => ({}) as never,
    crearUsuarioRepo: () =>
      ({
        obtenerPorId: async () => ({ nombre: { valor: "Luis Asesor" } }),
      }) as never,
  } as unknown as VentasControllerDeps;
}

function crearDepsSinPermisos(): VentasControllerDeps {
  return {
    ...crearDeps(),
    crearActualizarLead: () => ({
      ejecutar: async () =>
        resultadoFallido(
          new ErrorDeDominio("El asesor no puede modificar leads ajenos.", {
            codigo: "SIN_PERMISOS_LEAD",
          }),
        ),
    }),
  };
}

function crearDepsSinPermisosReasignacion(): VentasControllerDeps {
  return {
    ...crearDeps(),
    crearAsignarLeadAAsesor: () => ({
      ejecutar: async () =>
        resultadoFallido(
          new ErrorDeDominio("Solo el admin puede reasignar leads.", {
            codigo: "SIN_PERMISOS_REASIGNAR_LEAD",
          }),
        ),
    }),
  } as unknown as VentasControllerDeps;
}

function crearCapturadas(): VentasEntradasCapturadas {
  return {
    registrarLead: [],
    actualizarLead: [],
    agendarCita: [],
    crearContrato: [],
    firmarContrato: [],
    asignarLead: [],
  };
}

describe("http / ventas routes", () => {
  it("lista pipeline para asesor autenticado con nombre de asesor resuelto", async () => {
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps()));

    const res = await app.request(
      "/ventas/pipeline",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "usuario-1", rol: "ASESOR" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: [
        expect.objectContaining({
          id: "lead-1",
          nombre: "Ana Vendedora",
          estado: "NUEVO",
          tipo: "VENTA",
          idAsesor: "usuario-1",
          nombreAsesor: "Luis Asesor",
        }),
      ],
    });
  });

  it("serializa el detalle de lead sin filtrar value objects internos", async () => {
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps()));

    const res = await app.request(
      "/ventas/lead/lead-1",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "usuario-1", rol: "ASESOR" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: expect.objectContaining({
        id: "lead-1",
        estado: "NUEVO",
        tipo: "VENTA",
        citas: [
          expect.objectContaining({
            id: "cita-1",
            estado: "PENDIENTE",
          }),
        ],
      }),
    });
  });

  it("registra lead de asesor asignandolo al usuario autenticado aunque el body mande otro asesor", async () => {
    const capturadas = crearCapturadas();
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps(capturadas)));

    const res = await app.request(
      "/ventas/lead",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: "Carlos Comprador",
          email: "carlos@example.com",
          telefono: "555",
          tipo: "COMPRA",
          idAsesor: "asesor-ajeno",
        }),
      },
      envConAuth,
    );

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true, data: { id: "lead-1" } });
    expect(capturadas.registrarLead[0]).toEqual(
      expect.objectContaining({
        nombre: "Carlos Comprador",
        tipo: "COMPRA",
        idAsesor: "asesor-1",
        usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
      }),
    );
  });

  it("permite que admin registre lead asignado a un asesor explicito", async () => {
    const capturadas = crearCapturadas();
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps(capturadas)));

    const res = await app.request(
      "/ventas/lead",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: "Maria Vendedora",
          email: "maria@example.com",
          telefono: "777",
          tipo: "VENTA",
          idAsesor: "asesor-2",
        }),
      },
      envConAuth,
    );

    expect(res.status).toBe(201);
    expect(capturadas.registrarLead[0]).toEqual(
      expect.objectContaining({
        idAsesor: "asesor-2",
        usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
      }),
    );
  });

  it("actualiza lead pasando id de ruta y usuario autenticado al use case", async () => {
    const capturadas = crearCapturadas();
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps(capturadas)));

    const res = await app.request(
      "/ventas/lead/lead-1",
      {
        method: "PUT",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "TRABAJANDO", telefono: "888" }),
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: "Lead actualizado" });
    expect(capturadas.actualizarLead[0]).toEqual(
      expect.objectContaining({
        id: "lead-1",
        estado: "TRABAJANDO",
        telefono: "888",
        usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
      }),
    );
  });

  it("responde 403 cuando el asesor intenta actualizar lead ajeno", async () => {
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDepsSinPermisos()));

    const res = await app.request(
      "/ventas/lead/lead-ajeno",
      {
        method: "PUT",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "TRABAJANDO" }),
      },
      envConAuth,
    );

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      success: false,
      message: "El asesor no puede modificar leads ajenos.",
      code: "SIN_PERMISOS_LEAD",
    });
  });

  it("reasigna lead preservando usuario admin autenticado", async () => {
    const capturadas = crearCapturadas();
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps(capturadas)));

    const res = await app.request(
      "/ventas/lead/lead-1/asesor",
      {
        method: "PUT",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idAsesor: "asesor-2" }),
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: "Lead reasignado" });
    expect(capturadas.asignarLead[0]).toEqual({
      idLead: "lead-1",
      idAsesor: "asesor-2",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });
  });

  it("responde 403 cuando asesor intenta reasignar lead", async () => {
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDepsSinPermisosReasignacion()));

    const res = await app.request(
      "/ventas/lead/lead-1/asesor",
      {
        method: "PUT",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idAsesor: "asesor-2" }),
      },
      envConAuth,
    );

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      success: false,
      message: "Solo el admin puede reasignar leads.",
      code: "SIN_PERMISOS_REASIGNAR_LEAD",
    });
  });

  it("agenda cita convirtiendo fecha de entrada y preservando asesor autenticado", async () => {
    const capturadas = crearCapturadas();
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps(capturadas)));

    const res = await app.request(
      "/ventas/cita",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idLead: "lead-1",
          fechaInicio: "2026-06-01T14:00:00.000Z",
          duracionMinutos: 60,
          observacion: "Visita a propiedad",
        }),
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: "Cita agendada" });
    expect(capturadas.agendarCita[0]).toEqual(
      expect.objectContaining({
        idLead: "lead-1",
        fechaInicio: new Date("2026-06-01T14:00:00.000Z"),
        duracionMinutos: 60,
        usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
      }),
    );
  });

  it("cancela contrato devolviendo mensaje de exito", async () => {
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps()));

    const res = await app.request(
      "/ventas/contratos/contrato-1/cancelar",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: "Contrato cancelado" });
  });

  it("responde error si el contrato a firmar no existe", async () => {
    const deps = {
      ...crearDeps(),
      crearFirmarContrato: () => ({
        ejecutar: async () =>
          resultadoFallido(new ErrorDeDominio("El contrato con id contrato-inexistente no ha sido encontrado.")),
      }),
    } as unknown as VentasControllerDeps;
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(deps));

    const res = await app.request(
      "/ventas/contratos/contrato-inexistente/firmar",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      message: "El contrato con id contrato-inexistente no ha sido encontrado.",
      code: "ERROR_DE_DOMINIO",
    });
  });

  it("responde error si el contrato a cancelar no existe", async () => {
    const deps = {
      ...crearDeps(),
      crearCancelarContrato: () => ({
        ejecutar: async () =>
          resultadoFallido(new ErrorDeDominio("El contrato con id contrato-inexistente no ha sido encontrado.")),
      }),
    } as unknown as VentasControllerDeps;
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(deps));

    const res = await app.request(
      "/ventas/contratos/contrato-inexistente/cancelar",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      message: "El contrato con id contrato-inexistente no ha sido encontrado.",
      code: "ERROR_DE_DOMINIO",
    });
  });

  it("lista contratos vacio cuando no hay ninguno", async () => {
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps()));

    const res = await app.request(
      "/ventas/contratos",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: [] });
  });

  it("lista contratos por asesor vacio cuando no tiene ninguno", async () => {
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps()));

    const res = await app.request(
      "/ventas/contratos/mios",
      {
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "asesor-1", rol: "ASESOR" }),
        },
      },
      envConAuth,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: [] });
  });

  it("firma contrato con lead asociado crea cliente y vincula propiedad al firmar", async () => {
    const capturadas = crearCapturadas();
    const deps = {
      ...crearDeps(capturadas),
      crearFirmarContrato: () => ({
        ejecutar: async (input: unknown) => {
          capturadas.firmarContrato.push(input);
          return resultadoExitoso(undefined);
        },
      }),
    };
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(deps));

    const crearRes = await app.request(
      "/ventas/contratos",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idLead: "lead-1",
          idPropiedad: "propiedad-1",
          fechaInicio: "2026-06-01T00:00:00.000Z",
          fechaFin: "2026-12-01T00:00:00.000Z",
        }),
      },
      envConAuth,
    );

    const firmarRes = await app.request(
      "/ventas/contratos/contrato-1/firmar",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(crearRes.status).toBe(201);
    expect(firmarRes.status).toBe(200);
    expect(await firmarRes.json()).toEqual({ success: true, message: "Contrato firmado" });
    expect(capturadas.firmarContrato[0]).toEqual({ idContrato: "contrato-1" });
  });

  it("crea y firma contrato desde el adaptador HTTP", async () => {
    const capturadas = crearCapturadas();
    const app = new Hono();
    app.route("/ventas", crearVentasRouter(crearDeps(capturadas)));

    const crearRes = await app.request(
      "/ventas/contratos",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "contrato-1",
          idLead: "lead-1",
          idPropiedad: "propiedad-1",
          fechaInicio: "2026-06-01T00:00:00.000Z",
          fechaFin: "2026-12-01T00:00:00.000Z",
        }),
      },
      envConAuth,
    );

    const firmarRes = await app.request(
      "/ventas/contratos/contrato-1/firmar",
      {
        method: "POST",
        headers: {
          Authorization: await crearAuthHeader({ idUsuario: "admin-1", rol: "ADMIN" }),
        },
      },
      envConAuth,
    );

    expect(crearRes.status).toBe(201);
    expect(await crearRes.json()).toEqual({
      success: true,
      data: expect.objectContaining({ id: "contrato-1", estado: "BORRADOR" }),
    });
    expect(capturadas.crearContrato[0]).toEqual(
      expect.objectContaining({
        id: "contrato-1",
        idLead: "lead-1",
        idPropiedad: "propiedad-1",
        fechaInicio: new Date("2026-06-01T00:00:00.000Z"),
        fechaFin: new Date("2026-12-01T00:00:00.000Z"),
      }),
    );
    expect(firmarRes.status).toBe(200);
    expect(await firmarRes.json()).toEqual({ success: true, message: "Contrato firmado" });
    expect(capturadas.firmarContrato[0]).toEqual({ idContrato: "contrato-1" });
  });
});
