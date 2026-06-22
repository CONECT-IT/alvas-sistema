import { describe, expect, mock, test } from "bun:test";

import { ConsultaRelacionPropiedadVentasAdapter } from "../../../../src/lib/propiedades/infrastructure/adapters/ConsultaRelacionPropiedadVentasAdapter";
import { type IVentasRepository } from "../../../../src/lib/ventas/domain/ports/IVentasRepository";
import { Lead } from "../../../../src/lib/ventas/domain/entities/Lead";
import { Cliente } from "../../../../src/lib/ventas/domain/entities/Cliente";
import { type IdUsuarioRef } from "../../../../src/lib/shared/domain/value-objects/IdUsuarioRef";

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

function crearLead(idAsesor: string): Lead {
  return Lead.registrar({
    id: "lead-1",
    nombre: "Lead Test",
    email: "test@test.com",
    telefono: "123456",
    tipo: "VENTA",
    idAsesor: idAsesor as IdUsuarioRef,
  });
}

function crearCliente(idAsesor: string): Cliente {
  return Cliente.crear({
    id: "cliente-1",
    nombre: "Cliente Test",
    email: "cliente@test.com",
    telefono: "654321",
    idAsesor: idAsesor as IdUsuarioRef,
  });
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
    repo.obtenerLeadPorId = mock(() => Promise.resolve(crearLead("asesor-1")));
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {
      idLeadOrigen: "lead-1",
    });

    expect(resultado).toBe(true);
  });

  test("retorna false cuando lead pertenece a otro asesor", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerLeadPorId = mock(() => Promise.resolve(crearLead("asesor-2")));
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {
      idLeadOrigen: "lead-1",
    });

    expect(resultado).toBe(false);
  });

  test("retorna true cuando cliente propietario pertenece al asesor", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerClientePorId = mock(() => Promise.resolve(crearCliente("asesor-1")));
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {
      idClientePropietario: "cliente-1",
    });

    expect(resultado).toBe(true);
  });

  test("retorna false cuando lead y cliente son de otros asesores", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerLeadPorId = mock(() => Promise.resolve(crearLead("asesor-2")));
    repo.obtenerClientePorId = mock(() => Promise.resolve(crearCliente("asesor-3")));
    const adapter = new ConsultaRelacionPropiedadVentasAdapter(repo);

    const resultado = await adapter.asesorGestionaPropiedad("asesor-1", {
      idLeadOrigen: "lead-1",
      idClientePropietario: "cliente-1",
    });

    expect(resultado).toBe(false);
  });
});
