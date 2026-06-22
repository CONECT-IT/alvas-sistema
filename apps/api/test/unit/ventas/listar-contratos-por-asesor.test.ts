import { describe, expect, mock, test } from "bun:test";

import { ListarContratosPorAsesorUseCase } from "../../../src/lib/ventas/application/use-cases/ListarContratosPorAsesorUseCase";
import { Lead } from "../../../src/lib/ventas/domain/entities/Lead";
import { Contrato } from "../../../src/lib/ventas/domain/entities/Contrato";
import { idContrato, idLead, idPropiedad } from "../../../src/lib/ventas/domain/value-objects/Ids";
import { type IVentasRepository } from "../../../src/lib/ventas/domain/ports/IVentasRepository";
import { type IContratoRepository } from "../../../src/lib/ventas/domain/ports/IContratoRepository";

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

function crearContratoRepoMock(): IContratoRepository {
  return {
    buscarPorId: mock(() => Promise.resolve(null)),
    guardar: mock(() => Promise.resolve()),
    listar: mock(() => Promise.resolve([])),
    listarPorCliente: mock(() => Promise.resolve([])),
    listarPorLead: mock(() => Promise.resolve([])),
    listarPorIdsLead: mock(() => Promise.resolve([])),
  };
}

describe("ListarContratosPorAsesorUseCase", () => {
  test("retorna contratos del asesor", async () => {
    const ventasRepo = crearVentasRepoMock();
    const contratoRepo = crearContratoRepoMock();
    const lead = Lead.registrar({
      id: "lead-1",
      nombre: "Lead",
      email: "test@test.com",
      telefono: "123",
      tipo: "VENTA",
      idAsesor: "asesor-1",
    });
    const contrato = Contrato.crear({
      id: idContrato("contrato-1"),
      idLead: idLead("lead-1"),
      idPropiedad: idPropiedad("prop-1"),
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 86400000),
    });
    ventasRepo.listarLeadsPorAsesor = mock(() => Promise.resolve([lead]));
    contratoRepo.listarPorIdsLead = mock(() => Promise.resolve([contrato]));

    const useCase = new ListarContratosPorAsesorUseCase(contratoRepo, ventasRepo);
    const resultado = await useCase.ejecutar({ idAsesor: "asesor-1" });

    expect(resultado.esExito).toBe(true);
    expect(contratoRepo.listarPorIdsLead).toHaveBeenCalledTimes(1);
  });

  test("retorna lista vacia cuando no hay leads", async () => {
    const ventasRepo = crearVentasRepoMock();
    const contratoRepo = crearContratoRepoMock();

    const useCase = new ListarContratosPorAsesorUseCase(contratoRepo, ventasRepo);
    const resultado = await useCase.ejecutar({ idAsesor: "asesor-1" });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.contratos).toHaveLength(0);
    }
  });

  test("propaga error de repositorio", async () => {
    const ventasRepo = crearVentasRepoMock();
    const contratoRepo = crearContratoRepoMock();
    ventasRepo.listarLeadsPorAsesor = mock(() => Promise.reject(new Error("db error")));

    const useCase = new ListarContratosPorAsesorUseCase(contratoRepo, ventasRepo);

    await expect(useCase.ejecutar({ idAsesor: "asesor-1" })).rejects.toThrow("db error");
  });
});
