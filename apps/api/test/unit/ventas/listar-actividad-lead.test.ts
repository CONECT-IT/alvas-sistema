import { describe, expect, mock, test } from "bun:test";

import { ListarActividadLeadUseCase } from "../../../src/lib/ventas/application/use-cases/ListarActividadLeadUseCase";
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

describe("ListarActividadLeadUseCase", () => {
  test("retorna actividad del lead", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerActividadPorLead = mock(() =>
      Promise.resolve([
        {
          id: 1,
          idLead: "lead-1",
          evento: "CREADO",
          descripcion: "Lead creado",
          fecha: "2026-01-01",
        },
      ]),
    );

    const useCase = new ListarActividadLeadUseCase(repo);
    const resultado = await useCase.ejecutar({ idLead: "lead-1" });

    expect(resultado.esExito).toBe(true);
    expect(repo.obtenerActividadPorLead).toHaveBeenCalledTimes(1);
  });

  test("retorna lista vacia cuando no hay actividad", async () => {
    const repo = crearVentasRepoMock();

    const useCase = new ListarActividadLeadUseCase(repo);
    const resultado = await useCase.ejecutar({ idLead: "lead-1" });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor).toHaveLength(0);
    }
  });

  test("propaga error de repositorio", async () => {
    const repo = crearVentasRepoMock();
    repo.obtenerActividadPorLead = mock(() => Promise.reject(new Error("db error")));

    const useCase = new ListarActividadLeadUseCase(repo);

    await expect(useCase.ejecutar({ idLead: "lead-1" })).rejects.toThrow("db error");
  });
});
