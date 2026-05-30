import { describe, expect, test } from "bun:test";

import { ObtenerEstadisticasGlobalesUseCase } from "../../../src/lib/reportes/application/use-cases/ObtenerEstadisticasGlobalesUseCase";
import { ObtenerReporteGeneralUseCase } from "../../../src/lib/reportes/application/use-cases/ObtenerReporteGeneralUseCase";
import {
  type AccionResumenLectura,
  type ActividadRecienteLectura,
  type AsesorConTotalLeads,
  type ClienteLecturaParaReportes,
  type IConsultaVentasParaReportes,
  type LeadLecturaParaReportes,
} from "../../../src/lib/reportes/domain/ports/IConsultaVentasParaReportes";
import { ErrorDeDominio } from "../../../src/lib/shared/domain";

class FakeConsultaVentasParaReportes implements IConsultaVentasParaReportes {
  readonly limitesActividad: number[] = [];

  constructor(
    private readonly leads: LeadLecturaParaReportes[] = [],
    private readonly clientes: ClienteLecturaParaReportes[] = [],
    private readonly actividades: ActividadRecienteLectura[] = [],
    private readonly asesores: AsesorConTotalLeads[] = [],
    private readonly error?: ErrorDeDominio,
  ) {}

  async listarLeadsParaReporte(): Promise<LeadLecturaParaReportes[]> {
    if (this.error) throw this.error;
    return this.leads;
  }

  async listarClientesParaReporte(): Promise<ClienteLecturaParaReportes[]> {
    return this.clientes;
  }

  async obtenerActividadReciente(limite: number): Promise<ActividadRecienteLectura[]> {
    this.limitesActividad.push(limite);
    return this.actividades;
  }

  async listarAsesoresConTotalesLeads(): Promise<AsesorConTotalLeads[]> {
    return this.asesores;
  }

  async contarAccionesPorTipo(): Promise<AccionResumenLectura[]> {
    if (this.error) throw this.error;
    return [];
  }
}

describe("reportes / use cases", () => {
  test("ObtenerReporteGeneralUseCase arma resumenAcciones y actividadReciente", async () => {
    const actividad = [
      {
        idLead: "lead-001",
        evento: "CITA_AGENDADA",
        descripcion: "Cita inicial",
        fecha: "2026-05-21T10:00:00.000Z",
      },
    ];
    const consulta = new FakeConsultaVentasParaReportes([], [], actividad);
    consulta.contarAccionesPorTipo = async () => [
      { evento: "LEAD_CREADO", total: 2 },
      { evento: "CITA_AGENDADA", total: 1 },
    ];

    const resultado = await new ObtenerReporteGeneralUseCase(consulta).ejecutar();

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.resumenAcciones).toEqual({
        acciones: [
          { evento: "LEAD_CREADO", total: 2 },
          { evento: "CITA_AGENDADA", total: 1 },
        ],
        totalAcciones: 3,
      });
      expect(resultado.valor.actividadReciente).toEqual(actividad);
      expect(resultado.valor.fechaGeneracion).toBeInstanceOf(Date);
    }
    expect(consulta.limitesActividad).toEqual([10]);
  });

  test("ObtenerEstadisticasGlobalesUseCase devuelve resumen de acciones por tipo", async () => {
    const consulta = new FakeConsultaVentasParaReportes();
    consulta.contarAccionesPorTipo = async () => [
      { evento: "LEAD_CREADO", total: 5 },
      { evento: "CITA_AGENDADA", total: 3 },
      { evento: "CLIENTE_CONVERTIDO", total: 2 },
    ];

    const resultado = await new ObtenerEstadisticasGlobalesUseCase(consulta).ejecutar();

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : undefined).toEqual({
      acciones: [
        { evento: "LEAD_CREADO", total: 5 },
        { evento: "CITA_AGENDADA", total: 3 },
        { evento: "CLIENTE_CONVERTIDO", total: 2 },
      ],
      totalAcciones: 10,
    });
  });

  test("casos de uso de reportes devuelven fallo ante error de dominio", async () => {
    const consulta = new FakeConsultaVentasParaReportes(
      [],
      [],
      [],
      [],
      new ErrorDeDominio("Reporte no disponible", { codigo: "REPORTE_NO_DISPONIBLE" }),
    );

    const reporte = await new ObtenerReporteGeneralUseCase(consulta).ejecutar();
    const estadisticas = await new ObtenerEstadisticasGlobalesUseCase(consulta).ejecutar();

    expect(reporte.esExito).toBe(false);
    expect(reporte.esExito ? undefined : reporte.error.codigo).toBe("REPORTE_NO_DISPONIBLE");
    expect(estadisticas.esExito).toBe(false);
    expect(estadisticas.esExito ? undefined : estadisticas.error.codigo).toBe(
      "REPORTE_NO_DISPONIBLE",
    );
  });

  test("propaga errores no dominico en ObtenerReporteGeneralUseCase", async () => {
    const consulta = new FakeConsultaVentasParaReportes();
    consulta.contarAccionesPorTipo = () => Promise.reject(new Error("db error"));

    await expect(new ObtenerReporteGeneralUseCase(consulta).ejecutar()).rejects.toThrow("db error");
  });

  test("propaga errores no dominico en ObtenerEstadisticasGlobalesUseCase", async () => {
    const consulta = new FakeConsultaVentasParaReportes();
    consulta.contarAccionesPorTipo = () => Promise.reject(new Error("db error"));

    await expect(new ObtenerEstadisticasGlobalesUseCase(consulta).ejecutar()).rejects.toThrow(
      "db error",
    );
  });

  test("resumen de acciones vacio cuando no hay actividad", async () => {
    const consulta = new FakeConsultaVentasParaReportes();
    consulta.contarAccionesPorTipo = async () => [];

    const reporte = await new ObtenerReporteGeneralUseCase(consulta).ejecutar();
    const estadisticas = await new ObtenerEstadisticasGlobalesUseCase(consulta).ejecutar();

    expect(reporte.esExito).toBe(true);
    expect(estadisticas.esExito).toBe(true);
    if (reporte.esExito) {
      expect(reporte.valor.resumenAcciones.totalAcciones).toBe(0);
      expect(reporte.valor.resumenAcciones.acciones).toEqual([]);
    }
    if (estadisticas.esExito) {
      expect(estadisticas.valor.totalAcciones).toBe(0);
    }
  });
});
