import { describe, expect, test } from "bun:test";

import { ObtenerEstadisticasGlobalesUseCase } from "../../../src/lib/reportes/application/use-cases/ObtenerEstadisticasGlobalesUseCase";
import { ObtenerReporteGeneralUseCase } from "../../../src/lib/reportes/application/use-cases/ObtenerReporteGeneralUseCase";
import {
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
}

describe("reportes / use cases", () => {
  test("ObtenerReporteGeneralUseCase calcula conversion, leads de hoy y citas pendientes", async () => {
    const hoy = new Date();
    hoy.setHours(10, 0, 0, 0);
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const actividad = [
      {
        idLead: "lead-001",
        evento: "CITA_AGENDADA",
        descripcion: "Cita inicial",
        fecha: "2026-05-21T10:00:00.000Z",
      },
    ];
    const consulta = new FakeConsultaVentasParaReportes(
      [
        {
          id: "lead-001",
          estado: "NUEVO",
          creadoEn: hoy,
          citas: [{ estado: "PENDIENTE" }, { estado: "REALIZADA" }],
        },
        {
          id: "lead-002",
          estado: "CONVERTIDO",
          creadoEn: ayer,
          citas: [{ estado: "PENDIENTE" }],
        },
      ],
      [{ id: "cliente-001" }],
      actividad,
    );

    const resultado = await new ObtenerReporteGeneralUseCase(consulta).ejecutar();

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.metricas).toEqual({
        conversionRate: 50,
        leadsNuevosHoy: 1,
        citasPendientes: 2,
      });
      expect(resultado.valor.actividadReciente).toEqual(actividad);
      expect(resultado.valor.fechaGeneracion).toBeInstanceOf(Date);
    }
    expect(consulta.limitesActividad).toEqual([10]);
  });

  test("ObtenerEstadisticasGlobalesUseCase agrupa leads por estado y asesores activos", async () => {
    const consulta = new FakeConsultaVentasParaReportes(
      [
        { id: "lead-001", estado: "NUEVO", creadoEn: new Date(), citas: [] },
        { id: "lead-002", estado: "NUEVO", creadoEn: new Date(), citas: [] },
        { id: "lead-003", estado: "CONVERTIDO", creadoEn: new Date(), citas: [] },
      ],
      [{ id: "cliente-001" }, { id: "cliente-002" }],
      [],
      [
        { idAsesor: "asesor-1", totalLeads: 2 },
        { idAsesor: "asesor-2", totalLeads: 1 },
      ],
    );

    const resultado = await new ObtenerEstadisticasGlobalesUseCase(consulta).ejecutar();

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : undefined).toEqual({
      totalLeads: 3,
      totalClientes: 2,
      leadsPorEstado: { NUEVO: 2, CONVERTIDO: 1 },
      asesoresActivos: 2,
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
});
