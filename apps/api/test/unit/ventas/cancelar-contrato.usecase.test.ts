import { describe, expect, mock, test } from "bun:test";

import { CancelarContratoUseCase } from "../../../src/lib/ventas/application/use-cases/CancelarContratoUseCase";
import { Contrato } from "../../../src/lib/ventas/domain/entities/Contrato";
import { type IContratoRepository } from "../../../src/lib/ventas/domain/ports/IContratoRepository";

function crearRepoMock(): IContratoRepository {
  return {
    buscarPorId: mock(() => Promise.resolve(null)),
    guardar: mock(() => Promise.resolve()),
    listar: mock(() => Promise.resolve([])),
    listarPorCliente: mock(() => Promise.resolve([])),
    listarPorLead: mock(() => Promise.resolve([])),
    listarPorIdsLead: mock(() => Promise.resolve([])),
  };
}

function crearContrato(): Contrato {
  return Contrato.crear({
    id: "contrato-1" as any,
    idLead: "lead-1" as any,
    idPropiedad: "prop-1" as any,
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 86400000 * 30),
  });
}

describe("CancelarContratoUseCase", () => {
  test("cancela contrato existente", async () => {
    const repo = crearRepoMock();
    const contrato = crearContrato();
    repo.buscarPorId = mock(() => Promise.resolve(contrato));

    const useCase = new CancelarContratoUseCase(repo);
    const resultado = await useCase.ejecutar({ idContrato: "contrato-1" });

    expect(resultado.esExito).toBe(true);
    expect(repo.guardar).toHaveBeenCalledTimes(1);
  });

  test("retorna error cuando contrato no existe", async () => {
    const repo = crearRepoMock();
    const useCase = new CancelarContratoUseCase(repo);

    const resultado = await useCase.ejecutar({ idContrato: "no-existe" });

    expect(resultado.esExito).toBe(false);
  });

  test("propaga error de repositorio", async () => {
    const repo = crearRepoMock();
    repo.buscarPorId = mock(() => Promise.reject(new Error("db error")));

    const useCase = new CancelarContratoUseCase(repo);

    await expect(useCase.ejecutar({ idContrato: "contrato-1" })).rejects.toThrow("db error");
  });
});
