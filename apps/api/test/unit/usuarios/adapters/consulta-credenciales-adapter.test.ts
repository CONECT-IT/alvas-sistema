import { describe, expect, mock, test } from "bun:test";

import { ConsultaCredencialesUsuarioAdapter } from "../../../../src/lib/usuarios/infrastructure/adapters/ConsultaCredencialesUsuarioAdapter";
import { Usuario } from "../../../../src/lib/usuarios/domain/entities";
import { type IUsuarioRepository } from "../../../../src/lib/usuarios/domain/ports";

function crearRepoMock(): IUsuarioRepository {
  return {
    obtenerPorId: mock(() => Promise.resolve(null)),
    existePorId: mock(() => Promise.resolve(false)),
    guardar: mock(() => Promise.resolve()),
    eliminarPorId: mock(() => Promise.resolve()),
    listar: mock(() => Promise.resolve([])),
    obtenerPorUsername: mock(() => Promise.resolve(null)),
    existePorUsername: mock(() => Promise.resolve(false)),
  };
}

describe("ConsultaCredencialesUsuarioAdapter", () => {
  test("buscarPorId retorna credenciales cuando usuario existe", async () => {
    const repo = crearRepoMock();
    const usuario = Usuario.crear({
      id: "user-001",
      username: "jperez",
      nombre: "Juan Perez",
      hashClave: "hash-seguro",
      rol: "ASESOR",
    });
    repo.obtenerPorId = mock(() => Promise.resolve(usuario));

    const adapter = new ConsultaCredencialesUsuarioAdapter(repo);
    const resultado = await adapter.buscarPorId("user-001");

    expect(resultado).not.toBeNull();
    expect(resultado!.idUsuario).toBe("user-001");
    expect(resultado!.username).toBe("jperez");
    expect(resultado!.hashClave).toBe("hash-seguro");
    expect(resultado!.rol).toBe("ASESOR");
    expect(resultado!.estado).toBe("ACTIVO");
  });

  test("buscarPorId retorna null cuando usuario no existe", async () => {
    const repo = crearRepoMock();
    const adapter = new ConsultaCredencialesUsuarioAdapter(repo);
    const resultado = await adapter.buscarPorId("user-no-existe");

    expect(resultado).toBeNull();
  });

  test("buscarPorId retorna null cuando hay error", async () => {
    const repo = crearRepoMock();
    repo.obtenerPorId = mock(() => Promise.reject(new Error("db error")));

    const adapter = new ConsultaCredencialesUsuarioAdapter(repo);
    const resultado = await adapter.buscarPorId("user-001");

    expect(resultado).toBeNull();
  });

  test("buscarPorUsername retorna credenciales cuando usuario existe", async () => {
    const repo = crearRepoMock();
    const usuario = Usuario.crear({
      id: "user-001",
      username: "jperez",
      nombre: "Juan Perez",
      hashClave: "hash-seguro",
      rol: "ASESOR",
    });
    repo.obtenerPorUsername = mock(() => Promise.resolve(usuario));

    const adapter = new ConsultaCredencialesUsuarioAdapter(repo);
    const resultado = await adapter.buscarPorUsername("jperez");

    expect(resultado).not.toBeNull();
    expect(resultado!.idUsuario).toBe("user-001");
    expect(resultado!.username).toBe("jperez");
  });

  test("buscarPorUsername retorna null cuando usuario no existe", async () => {
    const repo = crearRepoMock();
    const adapter = new ConsultaCredencialesUsuarioAdapter(repo);
    const resultado = await adapter.buscarPorUsername("noexiste");

    expect(resultado).toBeNull();
  });

  test("buscarPorUsername retorna null cuando hay error", async () => {
    const repo = crearRepoMock();
    repo.obtenerPorUsername = mock(() => Promise.reject(new Error("db error")));

    const adapter = new ConsultaCredencialesUsuarioAdapter(repo);
    const resultado = await adapter.buscarPorUsername("jperez");

    expect(resultado).toBeNull();
  });
});
