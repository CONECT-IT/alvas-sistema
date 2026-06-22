import { describe, expect, mock, test } from "bun:test";

import { ConsultaRelacionPropiedadVentasAdapter } from "../../../../src/lib/propiedades/infrastructure/adapters/ConsultaRelacionPropiedadVentasAdapter";
import { type IVentasRepository } from "../../../../src/lib/ventas/domain/ports/IVentasRepository";

function crearVentasRepoMock(): IVentasRepository {
  return {
    obtenerLeadPorId: mock(() => Promise.resolve(null)),
    obtenerClientePorId: mock(() => Promise.resolve(null)),
    obtenerCitaPorId: mock(() => Promise.resolve(null)),
    obtenerContratoPorId: mock(() => Promise.resolve(null)),
    guardarLead: mock(() => Promise.resolve()),
    guardarCliente: mock(() => Promise.resolve()),
    guardarCita: mock(() => Promise.resolve()),
    guardarContrato: mock(() => Promise.resolve()),
    eliminarLeadPorId: mock(() => Promise.resolve()),
    eliminarClientePorId: mock(() => Promise.resolve()),
    eliminarCitaPorId: mock(() => Promise.resolve()),
    eliminarContratoPorId: mock(() => Promise.resolve()),
    listarLeads: mock(() => Promise.resolve([])),
    listarClientes: mock(() => Promise.resolve([])),
    listarCitas: mock(() => Promise.resolve([])),
    listarContratos: mock(() => Promise.resolve([])),
    listarLeadsPorAsesor: mock(() => Promise.resolve([])),
    listarClientesPorAsesor: mock(() => Promise.resolve([])),
    listarCitasPorAsesor: mock(() => Promise.resolve([])),
    listarContratosPorAsesor: mock(() => Promise.resolve([])),
    listarPipeline: mock(() => Promise.resolve([])),
    listarActividadLead: mock(() => Promise.resolve([])),
  };
}

describe("ConsultaRelacionPropiedadVentasAdapter", () => {
  test("retorna false cuando no hay lead ni cliente", async () => {
    const repo = crearVentasRepoMock();
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {});

    expect(resultado).toBe(false);
  });

  test("retorna true cuando lead pertenece al asesor", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerLeadPorId = mock(() =>
      Promise.resolve({ id: "lead-1", idAsesor: "asesor-1" }),
    );
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {
      idLeadOrigen: "lead-1",
    });

    expect(resultado).toBe(true);
  });

  test("retorna false cuando lead pertenece a otro asesor", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerLeadPorId = mock(() =>
      Promise.resolve({ id: "lead-1", idAsesor: "asesor-2" }),
    );
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {
      idLeadOrigen: "lead-1",
    });

    expect(resultado).toBe(false);
  });

  test("retorna true cuando cliente propietario pertenece al asesor", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerClientePorId = mock(() =>
      Promise.resolve({ id: "cliente-1", idAsesor: "asesor-1" }),
    );
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {
      idClientePropietario: "cliente-1",
    });

    expect(resultado).toBe(true);
  });

  test("retorna false cuando lead y cliente son de otros asesores", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerLeadPorId = mock(() =>
      Promise.resolve({ id: "lead-1", idAsesor: "asesor-2" }),
    );
    repo.obtenerClientePorId = mock(() =>
      Promise.resolve({ id: "cliente-1", idAsesor: "asesor-3" }),
    );
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {
      idLeadOrigen: "lead-1",
      idClientePropietario: "cliente-1",
    });

    expect(resultado).toBe(false);
  });
});
