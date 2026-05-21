import { describe, expect, mock, test } from "bun:test";

import { ActualizarUsuarioUseCase } from "../../../src/lib/usuarios/application/use-cases/ActualizarUsuarioUseCase";
import { CrearUsuarioUseCase } from "../../../src/lib/usuarios/application/use-cases/CrearUsuarioUseCase";
import { Usuario } from "../../../src/lib/usuarios/domain/entities";
import {
  type IPasswordHasher,
  type IUsuarioRepository,
} from "../../../src/lib/usuarios/domain/ports";
import { HashClave, IdUsuario, Username } from "../../../src/lib/usuarios/domain/value-objects";

class FakeUsuarioRepository implements IUsuarioRepository {
  readonly usuarios = new Map<string, Usuario>();

  async obtenerPorId(id: IdUsuario): Promise<Usuario | null> {
    return this.usuarios.get(id.valor) ?? null;
  }

  async existePorId(id: IdUsuario): Promise<boolean> {
    return this.usuarios.has(id.valor);
  }

  async guardar(usuario: Usuario): Promise<void> {
    this.usuarios.set(usuario.id.valor, usuario);
  }

  async eliminarPorId(id: IdUsuario): Promise<void> {
    this.usuarios.delete(id.valor);
  }

  async listar(): Promise<Usuario[]> {
    return [...this.usuarios.values()];
  }

  async obtenerPorUsername(username: Username): Promise<Usuario | null> {
    return (
      [...this.usuarios.values()].find((usuario) => usuario.username.valor === username.valor) ??
      null
    );
  }

  async existePorUsername(username: Username): Promise<boolean> {
    return (await this.obtenerPorUsername(username)) !== null;
  }
}

class FakePasswordHasher implements IPasswordHasher {
  async hashear(): Promise<HashClave> {
    return new HashClave("hash-seguro-001");
  }

  async comparar(clavePlana: string, hashGuardado: string): Promise<boolean> {
    return clavePlana === "secreto" && hashGuardado === "hash-seguro-001";
  }
}

describe("usuarios / CrearUsuarioUseCase", () => {
  test("guarda usuario con hash generado", async () => {
    const repo = new FakeUsuarioRepository();
    const passwordHasher = new FakePasswordHasher();
    const hashearSpy = mock(passwordHasher.hashear.bind(passwordHasher));
    passwordHasher.hashear = hashearSpy;

    const resultado = await new CrearUsuarioUseCase(repo, passwordHasher).ejecutar({
      idUsuario: "user-001",
      username: "Asesor1",
      nombre: "Asesor Uno",
      clave: "secreto",
      rol: "ASESOR",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.usuarios.size).toBe(1);
    expect(hashearSpy).toHaveBeenCalledTimes(1);
    if (resultado.esExito) {
      expect(resultado.valor.username.valor).toBe("asesor1");
      expect(resultado.valor.hashClave.valor).toBe("hash-seguro-001");
    }
  });

  test("rechaza usernames duplicados", async () => {
    const repo = new FakeUsuarioRepository();
    const useCase = new CrearUsuarioUseCase(repo, new FakePasswordHasher());

    await useCase.ejecutar({
      idUsuario: "user-001",
      username: "asesor1",
      nombre: "Asesor Uno",
      clave: "secreto",
      rol: "ASESOR",
    });
    const duplicado = await useCase.ejecutar({
      idUsuario: "user-002",
      username: "asesor1",
      nombre: "Asesor Dos",
      clave: "secreto",
      rol: "ASESOR",
    });

    expect(duplicado.esExito).toBe(false);
  });
});

describe("usuarios / ActualizarUsuarioUseCase", () => {
  test("actualiza nombre, username y rol preservando id y estado", async () => {
    const repo = new FakeUsuarioRepository();
    await repo.guardar(
      Usuario.crear({
        id: "user-001",
        username: "asesor1",
        nombre: "Asesor Uno",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
      }),
    );

    const resultado = await new ActualizarUsuarioUseCase(repo).ejecutar({
      idUsuario: "user-001",
      nombre: " Asesor Principal ",
      username: " AsesorPrincipal ",
      rol: "ADMIN",
    });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.id).toBe("user-001");
      expect(resultado.valor.nombre).toBe("Asesor Principal");
      expect(resultado.valor.username).toBe("asesorprincipal");
      expect(resultado.valor.rol).toBe("ADMIN");
      expect(resultado.valor.estado).toBe("ACTIVO");
      expect(resultado.valor.creadoEn).toContain("T");
      expect(resultado.valor.actualizadoEn).toContain("T");
    }
    expect(repo.usuarios.get("user-001")?.username.valor).toBe("asesorprincipal");
  });

  test("rechaza usuario inexistente y no guarda cambios", async () => {
    const repo = new FakeUsuarioRepository();

    const resultado = await new ActualizarUsuarioUseCase(repo).ejecutar({
      idUsuario: "user-no-existe",
      nombre: "No importa",
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("USER_NOT_FOUND");
    expect(repo.usuarios.size).toBe(0);
  });
});
