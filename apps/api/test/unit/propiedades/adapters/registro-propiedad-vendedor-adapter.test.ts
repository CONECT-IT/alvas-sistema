import { describe, expect, mock, test } from "bun:test";

import { RegistroPropiedadVendedorAdapter } from "../../../../src/lib/propiedades/infrastructure/adapters/RegistroPropiedadVendedorAdapter";
import { type IPropiedadRepository } from "../../../../src/lib/propiedades/domain/ports";
import { type IGeneradorId } from "../../../../src/lib/shared/domain/ports/IGeneradorId";

function crearPropiedadRepoMock(): IPropiedadRepository {
  return {
    obtenerPorId: mock(() => Promise.resolve(null)),
    existePorId: mock(() => Promise.resolve(false)),
    guardar: mock(() => Promise.resolve()),
    eliminarPorId: mock(() => Promise.resolve()),
    listarTodas: mock(() => Promise.resolve([])),
  };
}

function crearGeneradorIdMock(): IGeneradorId {
  let contador = 0;
  return {
    generar: () => `prop-${String(++contador).padStart(3, "0")}`,
  };
}

describe("RegistroPropiedadVendedorAdapter", () => {
  test("registrar guarda propiedad en el repositorio", async () => {
    const repo = crearPropiedadRepoMock();
    const generador = crearGeneradorIdMock();

    const adapter = new RegistroPropiedadVendedorAdapter(repo, generador);
    const resultado = await adapter.registrar({
      titulo: "Casa en venta",
      descripcion: "Hermosa casa",
      precio: 150000,
      idLeadOrigen: "lead-1",
      idAsesor: "asesor-1",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.guardar).toHaveBeenCalledTimes(1);
  });

  test("registrar retorna id de la propiedad creada", async () => {
    const repo = crearPropiedadRepoMock();
    const generador = crearGeneradorIdMock();

    const adapter = new RegistroPropiedadVendedorAdapter(repo, generador);
    const resultado = await adapter.registrar({
      titulo: "Casa en venta",
      descripcion: "Hermosa casa",
      precio: 150000,
      idLeadOrigen: "lead-1",
      idAsesor: "asesor-1",
    });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.id).toBeDefined();
    }
  });
});
