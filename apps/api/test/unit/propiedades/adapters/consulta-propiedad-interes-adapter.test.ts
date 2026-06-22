import { describe, expect, mock, test } from "bun:test";

import { ConsultaPropiedadInteresVentasAdapter } from "../../../../src/lib/propiedades/infrastructure/adapters/ConsultaPropiedadInteresVentasAdapter";
import { type IPropiedadRepository } from "../../../../src/lib/propiedades/domain/ports";

function crearPropiedadRepoMock(): IPropiedadRepository {
  return {
    obtenerPorId: mock(() => Promise.resolve(null)),
    existePorId: mock(() => Promise.resolve(false)),
    guardar: mock(() => Promise.resolve()),
    eliminarPorId: mock(() => Promise.resolve()),
    listarTodas: mock(() => Promise.resolve([])),
  };
}

describe("ConsultaPropiedadInteresVentasAdapter", () => {
  test("propiedadDisponibleParaCompra retorna false cuando propiedad no existe", async () => {
    const repo = crearPropiedadRepoMock();
    const adapter = new ConsultaPropiedadInteresVentasAdapter(repo);
    const resultado = await adapter.propiedadDisponibleParaCompra("prop-1");

    expect(resultado).toBe(false);
  });

  test("propiedadDisponibleParaCompra retorna false cuando propiedad no tiene estado", async () => {
    const repo = crearPropiedadRepoMock();
    repo.obtenerPorId = mock(() =>
      Promise.resolve({ estado: null }),
    );
    const adapter = new ConsultaPropiedadInteresVentasAdapter(repo);
    const resultado = await adapter.propiedadDisponibleParaCompra("prop-1");

    expect(resultado).toBe(false);
  });
});
