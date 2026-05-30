import { describe, expect, mock, test } from "bun:test";

import { ErrorDeDominio } from "../../../src/lib/shared/domain/errors/ErrorDeDominio";
import { ActualizarUsuarioUseCase } from "../../../src/lib/usuarios/application/use-cases/ActualizarUsuarioUseCase";
import { CrearUsuarioUseCase } from "../../../src/lib/usuarios/application/use-cases/CrearUsuarioUseCase";
import { ListarUsuariosUseCase } from "../../../src/lib/usuarios/application/use-cases/ListarUsuariosUseCase";
import { ObtenerUsuarioUseCase } from "../../../src/lib/usuarios/application/use-cases/ObtenerUsuarioUseCase";
import { Usuario } from "../../../src/lib/usuarios/domain/entities";
import {
  type IPasswordHasher,
  type IUsuarioRepository,
} from "../../../src/lib/usuarios/domain/ports";
import { type IGeneradorId } from "../../../src/lib/shared/domain/ports";
import { HashClave, Username } from "../../../src/lib/usuarios/domain/value-objects";

class FakeUsuarioRepository implements IUsuarioRepository {
  readonly usuarios = new Map<string, Usuario>();

  async obtenerPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.get(id) ?? null;
  }

  async existePorId(id: string): Promise<boolean> {
    return this.usuarios.has(id);
  }

  async guardar(usuario: Usuario): Promise<void> {
    this.usuarios.set(usuario.id.valor, usuario);
  }

  async eliminarPorId(id: string): Promise<void> {
    this.usuarios.delete(id);
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

class FakeGeneradorId implements IGeneradorId {
  private contador = 0;
  generar(): string {
    this.contador++;
    return `user-${String(this.contador).padStart(3, "0")}`;
  }
}

describe("usuarios / CrearUsuarioUseCase", () => {
  test("guarda usuario con hash generado", async () => {
    const repo = new FakeUsuarioRepository();
    const passwordHasher = new FakePasswordHasher();
    const hashearSpy = mock(passwordHasher.hashear.bind(passwordHasher));
    passwordHasher.hashear = hashearSpy;

    const resultado = await new CrearUsuarioUseCase(repo, passwordHasher, new FakeGeneradorId()).ejecutar({
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
    const useCase = new CrearUsuarioUseCase(repo, new FakePasswordHasher(), new FakeGeneradorId());

    await useCase.ejecutar({
      username: "asesor1",
      nombre: "Asesor Uno",
      clave: "secreto",
      rol: "ASESOR",
    });
    const duplicado = await useCase.ejecutar({
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

  test("actualiza clave con hash generado sin exponerla en la respuesta", async () => {
    const repo = new FakeUsuarioRepository();
    const passwordHasher = new FakePasswordHasher();
    const hashearSpy = mock(passwordHasher.hashear.bind(passwordHasher));
    passwordHasher.hashear = hashearSpy;
    await repo.guardar(
      Usuario.crear({
        id: "user-001",
        username: "asesor1",
        nombre: "Asesor Uno",
        hashClave: "hash-anterior-001",
        rol: "ASESOR",
      }),
    );

    const resultado = await new ActualizarUsuarioUseCase(repo, passwordHasher).ejecutar({
      idUsuario: "user-001",
      clave: "nueva-clave",
    });

    expect(resultado.esExito).toBe(true);
    expect(hashearSpy).toHaveBeenCalledTimes(1);
    expect(repo.usuarios.get("user-001")?.hashClave.valor).toBe("hash-seguro-001");
    if (resultado.esExito) {
      expect(JSON.stringify(resultado.valor)).not.toContain("hashClave");
      expect(JSON.stringify(resultado.valor)).not.toContain("nueva-clave");
    }
  });

  test("rechaza usuario inexistente y no guarda cambios", async () => {
    const repo = new FakeUsuarioRepository();

    const resultado = await new ActualizarUsuarioUseCase(repo).ejecutar({
      idUsuario: "user-no-existe",
      nombre: "No importa",
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toBe("Usuario no encontrado");
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("USER_NOT_FOUND");
    expect(repo.usuarios.size).toBe(0);
  });
});

describe("usuarios / ObtenerUsuarioUseCase", () => {
  test("devuelve usuario existente con todos los campos", async () => {
    const repo = new FakeUsuarioRepository();
    await repo.guardar(
      Usuario.crear({
        id: "user-001",
        username: "jperez",
        nombre: "Juan Perez",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
      }),
    );

    const resultado = await new ObtenerUsuarioUseCase(repo).ejecutar({
      idUsuario: "user-001",
    });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.id).toBe("user-001");
      expect(resultado.valor.username).toBe("jperez");
      expect(resultado.valor.nombre).toBe("Juan Perez");
      expect(resultado.valor.rol).toBe("ASESOR");
      expect(resultado.valor.estado).toBe("ACTIVO");
    }
  });

  test("rechaza usuario inexistente", async () => {
    const repo = new FakeUsuarioRepository();

    const resultado = await new ObtenerUsuarioUseCase(repo).ejecutar({
      idUsuario: "user-no-existe",
    });

    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.message).toContain("user-no-existe");
  });
});

describe("usuarios / ListarUsuariosUseCase", () => {
  test("devuelve lista de usuarios", async () => {
    const repo = new FakeUsuarioRepository();
    await repo.guardar(
      Usuario.crear({
        id: "user-001",
        username: "jperez",
        nombre: "Juan Perez",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
      }),
    );
    await repo.guardar(
      Usuario.crear({
        id: "user-002",
        username: "admin1",
        nombre: "Admin Uno",
        hashClave: "hash-seguro-002",
        rol: "ADMIN",
      }),
    );

    const resultado = await new ListarUsuariosUseCase(repo).ejecutar();

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : []).toHaveLength(2);
    if (resultado.esExito) {
      expect(resultado.valor[0]!.username).toBe("jperez");
      expect(resultado.valor[1]!.username).toBe("admin1");
    }
  });

  test("devuelve lista vacia cuando no hay usuarios", async () => {
    const repo = new FakeUsuarioRepository();

    const resultado = await new ListarUsuariosUseCase(repo).ejecutar();

    expect(resultado.esExito).toBe(true);
    expect(resultado.esExito ? resultado.valor : []).toHaveLength(0);
  });
});

describe("usuarios / propaga errores no dominio", () => {
  test("CrearUsuarioUseCase propaga error de repositorio", async () => {
    const repo = new FakeUsuarioRepository();
    repo.guardar = () => Promise.reject(new Error("db error"));

    await expect(
      new CrearUsuarioUseCase(repo, new FakePasswordHasher(), new FakeGeneradorId()).ejecutar({
        username: "test",
        nombre: "Test",
        clave: "secreto",
        rol: "ASESOR",
      }),
    ).rejects.toThrow("db error");
  });

  test("ActualizarUsuarioUseCase propaga error de repositorio", async () => {
    const repo = new FakeUsuarioRepository();
    const usuario = Usuario.crear({
      id: "user-001",
      username: "test",
      nombre: "Test",
      hashClave: "hash-seguro-001",
      rol: "ASESOR",
    });
    await repo.guardar(usuario);
    repo.guardar = () => Promise.reject(new Error("db error"));

    await expect(
      new ActualizarUsuarioUseCase(repo).ejecutar({ idUsuario: "user-001", nombre: "Nuevo" }),
    ).rejects.toThrow("db error");
  });

  test("ObtenerUsuarioUseCase propaga error de repositorio", async () => {
    const repo = new FakeUsuarioRepository();
    repo.obtenerPorId = () => Promise.reject(new Error("db error"));

    await expect(
      new ObtenerUsuarioUseCase(repo).ejecutar({ idUsuario: "user-001" }),
    ).rejects.toThrow("db error");
  });

  test("ListarUsuariosUseCase propaga error de repositorio", async () => {
    const repo = new FakeUsuarioRepository();
    repo.listar = () => Promise.reject(new Error("db error"));

    await expect(new ListarUsuariosUseCase(repo).ejecutar()).rejects.toThrow("db error");
  });

  test("captura ErrorDeDominio como resultadoFallido en CrearUsuarioUseCase", async () => {
    const repo = new FakeUsuarioRepository();
    repo.guardar = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new CrearUsuarioUseCase(repo, new FakePasswordHasher(), new FakeGeneradorId()).ejecutar({
      username: "test",
      nombre: "Test",
      clave: "secreto",
      rol: "ASESOR",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ActualizarUsuarioUseCase", async () => {
    const repo = new FakeUsuarioRepository();
    const usuario = Usuario.crear({
      id: "user-001",
      username: "test",
      nombre: "Test",
      hashClave: "hash-seguro-001",
      rol: "ASESOR",
    });
    await repo.guardar(usuario);
    repo.guardar = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ActualizarUsuarioUseCase(repo).ejecutar({
      idUsuario: "user-001",
      nombre: "Nuevo",
    });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ObtenerUsuarioUseCase", async () => {
    const repo = new FakeUsuarioRepository();
    repo.obtenerPorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ObtenerUsuarioUseCase(repo).ejecutar({ idUsuario: "user-001" });

    expect(resultado.esExito).toBe(false);
  });

  test("captura ErrorDeDominio como resultadoFallido en ListarUsuariosUseCase", async () => {
    const repo = new FakeUsuarioRepository();
    repo.listar = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new ListarUsuariosUseCase(repo).ejecutar();

    expect(resultado.esExito).toBe(false);
  });
});
