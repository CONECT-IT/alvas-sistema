import { describe, expect, mock, test } from "bun:test";

import { ListarPipelineUseCase } from "../../../src/lib/ventas/application/use-cases/ListarPipelineUseCase";
import { Lead } from "../../../src/lib/ventas/domain/entities/Lead";
import { type IVentasRepository } from "../../../src/lib/ventas/domain/ports/IVentasRepository";
import { type IConsultaNombreAsesor } from "../../../src/lib/ventas/domain/ports/IConsultaNombreAsesor";

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

function crearConsultaNombreAsesorMock(): IConsultaNombreAsesor {
  return {
    obtenerNombre: mock(() => Promise.resolve("Asesor Test")),
  };
}

function crearLead(): Lead {
  return Lead.registrar({
    id: "lead-1",
    nombre: "Lead Test",
    email: "test@test.com",
    telefono: "123456",
    tipo: "VENTA",
    idAsesor: "asesor-1",
  });
}

describe("ListarPipelineUseCase", () => {
  test("retorna pipeline para admin (todos los leads)", async () => {
    const repo = crearVentasRepoMock();
    const consultaNombre = crearConsultaNombreAsesorMock();
    repo.listarLeads = mock(() => Promise.resolve([crearLead()]));

    const useCase = new ListarPipelineUseCase(repo, consultaNombre);
    const resultado = await useCase.ejecutar({
      rolEjecutor: "ADMIN",
      idUsuarioEjecutor: "admin-1",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.listarLeads).toHaveBeenCalledTimes(1);
  });

  test("retorna pipeline para asesor (leads propios)", async () => {
    const repo = crearVentasRepoMock();
    const consultaNombre = crearConsultaNombreAsesorMock();
    repo.listarLeadsPorAsesor = mock(() => Promise.resolve([crearLead()]));

    const useCase = new ListarPipelineUseCase(repo, consultaNombre);
    const resultado = await useCase.ejecutar({
      rolEjecutor: "ASESOR",
      idUsuarioEjecutor: "asesor-1",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.listarLeadsPorAsesor).toHaveBeenCalledTimes(1);
  });

  test("retorna lista vacia cuando no hay leads", async () => {
    const repo = crearVentasRepoMock();
    const consultaNombre = crearConsultaNombreAsesorMock();

    const useCase = new ListarPipelineUseCase(repo, consultaNombre);
    const resultado = await useCase.ejecutar({
      rolEjecutor: "ADMIN",
      idUsuarioEjecutor: "admin-1",
    });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor).toHaveLength(0);
    }
  });

  test("propaga error de repositorio", async () => {
    const repo = crearVentasRepoMock();
    const consultaNombre = crearConsultaNombreAsesorMock();
    repo.listarLeads = mock(() => Promise.reject(new Error("db error")));

    const useCase = new ListarPipelineUseCase(repo, consultaNombre);

    await expect(
      useCase.ejecutar({ rolEjecutor: "ADMIN", idUsuarioEjecutor: "admin-1" }),
    ).rejects.toThrow("db error");
  });
});
