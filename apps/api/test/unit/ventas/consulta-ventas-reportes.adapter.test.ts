import { describe, expect, mock, test } from "bun:test";

import { ConsultaVentasParaReportesAdapter } from "../../../src/lib/ventas/infrastructure/adapters/ConsultaVentasParaReportesAdapter";
import { type IVentasRepository } from "../../../src/lib/ventas/domain/ports/IVentasRepository";

function crearVentasRepoMock(): IVentasRepository {
  return {
    obtenerLeadPorId: mock(() => Promise.resolve(null)),
    guardarLead: mock(() => Promise.resolve()),
    listarLeads: mock(() => Promise.resolve([])),
    listarLeadsPorAsesor: mock(() => Promise.resolve([])),
    listarLeadsPorEstado: mock(() => Promise.resolve([])),
    obtenerClientePorId: mock(() => Promise.resolve(null)),
    guardarCliente: mock(() => Promise.resolve()),
    listarClientes: mock(() => Promise.resolve([])),
    listarClientesPorAsesor: mock(() => Promise.resolve([])),
    registrarActividad: mock(() => Promise.resolve()),
    obtenerActividadReciente: mock(() => Promise.resolve([])),
    obtenerActividadPorLead: mock(() => Promise.resolve([])),
    listarAsesoresConLeads: mock(() => Promise.resolve([])),
    contarAccionesPorTipo: mock(() => Promise.resolve([])),
  };
}

describe("ConsultaVentasParaReportesAdapter", () => {
  test("listarLeadsParaReporte retorna leads formateados", async () => {
    const repo = crearVentasRepoMock();
    repo.listarLeads = mock(() =>
      Promise.resolve([
        {
          id: "lead-1",
          estado: { valor: "NUEVO" },
          creadoEn: new Date(),
          citas: [{ estado: { valor: "PENDIENTE" } }],
        },
      ]),
    );

    const adapter = new ConsultaVentasParaReportesAdapter(repo);
    const resultado = await adapter.listarLeadsParaReporte();

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("lead-1");
  });

  test("listarClientesParaReporte retorna clientes formateados", async () => {
    const repo = crearVentasRepoMock();
    repo.listarClientes = mock(() =>
      Promise.resolve([{ id: "cliente-1" }]),
    );

    const adapter = new ConsultaVentasParaReportesAdapter(repo);
    const resultado = await adapter.listarClientesParaReporte();

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("cliente-1");
  });

  test("obtenerActividadReciente delega al repositorio", async () => {
    const repo = crearVentasRepoMock();
    const adapter = new ConsultaVentasParaReportesAdapter(repo);

    await adapter.obtenerActividadReciente(10);

    expect(repo.obtenerActividadReciente).toHaveBeenCalledWith(10);
  });

  test("listarAsesoresConTotalesLeads retorna asesores formateados", async () => {
    const repo = crearVentasRepoMock();
    repo.listarAsesoresConLeads = mock(() =>
      Promise.resolve([{ idAsesor: "asesor-1", totalLeads: 5 }]),
    );

    const adapter = new ConsultaVentasParaReportesAdapter(repo);
    const resultado = await adapter.listarAsesoresConTotalesLeads();

    expect(resultado).toHaveLength(1);
    expect(resultado[0].idAsesor).toBe("asesor-1");
    expect(resultado[0].totalLeads).toBe(5);
  });

  test("contarAccionesPorTipo delega al repositorio", async () => {
    const repo = crearVentasRepoMock();
    repo.contarAccionesPorTipo = mock(() =>
      Promise.resolve([{ evento: "CREADO", total: 10 }]),
    );

    const adapter = new ConsultaVentasParaReportesAdapter(repo);
    const resultado = await adapter.contarAccionesPorTipo();

    expect(resultado).toHaveLength(1);
    expect(repo.contarAccionesPorTipo).toHaveBeenCalledTimes(1);
  });
});
