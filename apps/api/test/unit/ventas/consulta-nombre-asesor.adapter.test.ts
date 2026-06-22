import { describe, expect, mock, test } from "bun:test";

import { ConsultaNombreAsesorAdapter } from "../../../src/lib/ventas/infrastructure/adapters/ConsultaNombreAsesorAdapter";
import { type IUsuarioRepository } from "../../../src/lib/usuarios/domain/ports/IUsuarioRepository";

describe("ConsultaNombreAsesorAdapter", () => {
  test("obtenerNombre retorna undefined cuando usuario no existe", async () => {
    const repo: IUsuarioRepository = {
      obtenerPorId: mock(() => Promise.resolve(null)),
      existePorId: mock(() => Promise.resolve(false)),
      guardar: mock(() => Promise.resolve()),
      eliminarPorId: mock(() => Promise.resolve()),
      listar: mock(() => Promise.resolve([])),
      obtenerPorUsername: mock(() => Promise.resolve(null)),
      existePorUsername: mock(() => Promise.resolve(false)),
    };

    const adapter = new ConsultaNombreAsesorAdapter(repo);
    const nombre = await adapter.obtenerNombre("no-existe");

    expect(nombre).toBeUndefined();
    expect(repo.obtenerPorId).toHaveBeenCalledWith("no-existe");
  });

  test("obtenerNombre retorna undefined cuando hay error", async () => {
    const repo: IUsuarioRepository = {
      obtenerPorId: mock(() => Promise.reject(new Error("db error"))),
      existePorId: mock(() => Promise.resolve(false)),
      guardar: mock(() => Promise.resolve()),
      eliminarPorId: mock(() => Promise.resolve()),
      listar: mock(() => Promise.resolve([])),
      obtenerPorUsername: mock(() => Promise.resolve(null)),
      existePorUsername: mock(() => Promise.resolve(false)),
    };

    const adapter = new ConsultaNombreAsesorAdapter(repo);
    const nombre = await adapter.obtenerNombre("user-001");

    expect(nombre).toBeUndefined();
  });
});
