import { describe, expect, test } from "bun:test";

import { UsuarioMapper } from "../../../../src/lib/usuarios/infrastructure/persistence/UsuarioMapper";
import { Usuario } from "../../../../src/lib/usuarios/domain/entities";
import { type UsuarioRow } from "../../../../src/lib/usuarios/infrastructure/persistence/schema";

function crearRow(parcial: Partial<UsuarioRow> = {}): UsuarioRow {
  return {
    id: "user-001",
    username: "jperez",
    nombre: "Juan Perez",
    hashClave: "hash-seguro",
    rol: "ASESOR",
    estado: "ACTIVO",
    creadoEn: "2026-01-01T00:00:00.000Z",
    actualizadoEn: "2026-01-01T00:00:00.000Z",
    ...parcial,
  };
}

describe("UsuarioMapper.aDominio", () => {
  test("convierte row completa a Usuario de dominio", () => {
    const row = crearRow();
    const usuario = UsuarioMapper.aDominio(row);

    expect(usuario.id.valor).toBe("user-001");
    expect(usuario.username.valor).toBe("jperez");
    expect(usuario.nombre.valor).toBe("Juan Perez");
    expect(usuario.rol.valor).toBe("ASESOR");
    expect(usuario.estado.valor).toBe("ACTIVO");
  });

  test("usa id como fallback cuando nombre está vacío", () => {
    const row = crearRow({ nombre: "  " });
    const usuario = UsuarioMapper.aDominio(row);

    expect(usuario.nombre.valor).toBe("user-001");
  });

  test("usa id como fallback cuando username está vacío", () => {
    const row = crearRow({ username: "  " });
    const usuario = UsuarioMapper.aDominio(row);

    expect(usuario.username.valor).toBe("user-001");
  });

  test("usa fecha actual cuando creadoEn está vacío", () => {
    const row = crearRow({ creadoEn: "" });
    const usuario = UsuarioMapper.aDominio(row);

    expect(usuario.creadoEn).toBeInstanceOf(Date);
  });

  test("usa fecha actual cuando actualizadoEn está vacío", () => {
    const row = crearRow({ actualizadoEn: "" });
    const usuario = UsuarioMapper.aDominio(row);

    expect(usuario.actualizadoEn).toBeInstanceOf(Date);
  });
});

describe("UsuarioMapper.aPersistencia", () => {
  test("convierte Usuario a formato de persistencia", () => {
    const usuario = Usuario.crear({
      id: "user-001",
      username: "jperez",
      nombre: "Juan Perez",
      hashClave: "hash-seguro",
      rol: "ASESOR",
    });

    const persistencia = UsuarioMapper.aPersistencia(usuario);

    expect(persistencia.id).toBe("user-001");
    expect(persistencia.username).toBe("jperez");
    expect(persistencia.nombre).toBe("Juan Perez");
    expect(persistencia.hashClave).toBe("hash-seguro");
    expect(persistencia.rol).toBe("ASESOR");
    expect(persistencia.estado).toBe("ACTIVO");
    expect(persistencia.creadoEn).toContain("T");
    expect(persistencia.actualizadoEn).toContain("T");
  });
});

describe("UsuarioMapper.aRespuesta", () => {
  test("convierte Usuario a DTO de respuesta sin datos sensibles", () => {
    const usuario = Usuario.crear({
      id: "user-001",
      username: "jperez",
      nombre: "Juan Perez",
      hashClave: "hash-seguro",
      rol: "ASESOR",
    });

    const dto = UsuarioMapper.aRespuesta(usuario);

    expect(dto.id).toBe("user-001");
    expect(dto.username).toBe("jperez");
    expect(dto.nombre).toBe("Juan Perez");
    expect(dto.rol).toBe("ASESOR");
    expect(dto.estado).toBe("ACTIVO");
    expect(JSON.stringify(dto)).not.toContain("hashClave");
    expect(JSON.stringify(dto)).not.toContain("hash-seguro");
  });
});
