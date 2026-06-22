import { describe, expect, mock, test } from "bun:test";

import { ConsultaVentasParaReportesAdapter } from "../../../src/lib/ventas/infrastructure/adapters/ConsultaVentasParaReportesAdapter";
import { Lead } from "../../../src/lib/ventas/domain/entities/Lead";
import { Cliente } from "../../../src/lib/ventas/domain/entities/Cliente";
import { idUsuarioRef } from "../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
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
    const lead = Lead.registrar({
      id: "lead-1",
      nombre: "Lead Test",
      email: "test@test.com",
      telefono: "123456",
      tipo: "VENTA",
      idAsesor: "asesor-1",
    });
    repo.listarLeads = mock(() => Promise.resolve([lead]));

    const adapter = new ConsultaVentasParaReportesAdapter(repo);
    const resultado = await adapter.listarLeadsParaReporte();

    expect(resultado).toHaveLength(1);
    expect(resultado[0]!.id).toBe("lead-1");
  });

  test("listarClientesParaReporte retorna clientes formateados", async () => {
    const repo = crearVentasRepoMock();
    const cliente = Cliente.crear({
      id: "cliente-1",
      nombre: "Cliente Test",
      email: "cliente@test.com",
      telefono: "789012",
      idAsesor: idUsuarioRef("asesor-1"),
    });
    repo.listarClientes = mock(() => Promise.resolve([cliente]));

    const adapter = new ConsultaVentasParaReportesAdapter(repo);
    const resultado = await adapter.listarClientesParaReporte();

    expect(resultado).toHaveLength(1);
    expect(resultado[0]!.id).toBe("cliente-1");
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
    expect(resultado[0]!.idAsesor).toBe("asesor-1");
    expect(resultado[0]!.totalLeads).toBe(5);
  });

  test("contarAccionesPorTipo delega al repositorio", async () => {
    const repo = crearVentasRepoMock();
    repo.contarAccionesPorTipo = mock(() => Promise.resolve([{ evento: "CREADO", total: 10 }]));

    const adapter = new ConsultaVentasParaReportesAdapter(repo);
    const resultado = await adapter.contarAccionesPorTipo();

    expect(resultado).toHaveLength(1);
    expect(repo.contarAccionesPorTipo).toHaveBeenCalledTimes(1);
  });
});
