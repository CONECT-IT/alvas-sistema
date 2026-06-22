import { describe, expect, mock, test } from "bun:test";

import { RegistroPropiedadCaptacionAdapter } from "../../../../src/lib/propiedades/infrastructure/adapters/RegistroPropiedadCaptacionAdapter";
import { type IPropiedadRepository } from "../../../../src/lib/propiedades/domain/ports";
import { type IGeneradorId } from "../../../../src/lib/shared/domain/ports/IGeneradorId";

function crearRepoMock(): IPropiedadRepository {
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

describe("RegistroPropiedadCaptacionAdapter", () => {
  test("registra propiedad desde captacion con datos del input", async () => {
    const repo = crearRepoMock();
    const generador = crearGeneradorIdMock();
    const adapter = new RegistroPropiedadCaptacionAdapter(repo, generador);

    const resultado = await adapter.registrar({
      idLeadOrigen: "lead-1",
      nombreContacto: "Juan Perez",
      asesorCaptadorId: "asesor-1",
      origen: "whatsapp",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.guardar).toHaveBeenCalledTimes(1);
    if (resultado.esExito) {
      expect(resultado.valor.id).toBe("prop-001");
    }
  });

  test("usa metadata cuando está disponible", async () => {
    const repo = crearRepoMock();
    const generador = crearGeneradorIdMock();
    const adapter = new RegistroPropiedadCaptacionAdapter(repo, generador);

    const resultado = await adapter.registrar({
      idLeadOrigen: "lead-1",
      nombreContacto: "Juan Perez",
      asesorCaptadorId: "asesor-1",
      origen: "whatsapp",
      metadata: {
        tituloPropiedad: "Casa en venta",
        descripcionPropiedad: "Hermosa casa",
        precioEstimado: "150000",
      },
    });

    expect(resultado.esExito).toBe(true);
  });

  test("maneja precio no numérico como 0", async () => {
    const repo = crearRepoMock();
    const generador = crearGeneradorIdMock();
    const adapter = new RegistroPropiedadCaptacionAdapter(repo, generador);

    const resultado = await adapter.registrar({
      idLeadOrigen: "lead-1",
      nombreContacto: "Juan Perez",
      asesorCaptadorId: "asesor-1",
      origen: "whatsapp",
      metadata: {
        precioEstimado: "no-es-numero",
      },
    });

    expect(resultado.esExito).toBe(true);
  });
});
