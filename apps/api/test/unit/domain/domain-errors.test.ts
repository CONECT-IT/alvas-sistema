import { describe, expect, test } from "bun:test";
import { ErrorDeDominio } from "../../../src/lib/shared/domain/errors/ErrorDeDominio";
import { EstadoUsuarioInvalidoError } from "../../../src/lib/usuarios/domain/errors/EstadoUsuarioInvalidoError";
import { HashClaveUsuarioInvalidaError } from "../../../src/lib/usuarios/domain/errors/HashClaveUsuarioInvalidaError";
import { IdUsuarioInvalidoError } from "../../../src/lib/usuarios/domain/errors/IdUsuarioInvalidoError";
import { RolDeUsuarioInvalidoError } from "../../../src/lib/usuarios/domain/errors/RolDeUsuarioInvalidoError";
import { UsuarioNoEncontradoError } from "../../../src/lib/usuarios/domain/errors/UsuarioNoEncontradoError";
import { UsuarioYaDeshabilitadoError } from "../../../src/lib/usuarios/domain/errors/UsuarioYaDeshabilitadoError";
import { UsuarioYaExisteError } from "../../../src/lib/usuarios/domain/errors/UsuarioYaExisteError";
import { CitaNoEncontradaError } from "../../../src/lib/ventas/domain/errors/DomainErrors";
import { ClienteNoEncontradoError } from "../../../src/lib/ventas/domain/errors/DomainErrors";
import { ContratoNoEncontradoError } from "../../../src/lib/ventas/domain/errors/DomainErrors";
import { LeadNoEncontradoError } from "../../../src/lib/ventas/domain/errors/DomainErrors";
import { LeadYaConvertidoError } from "../../../src/lib/ventas/domain/errors/DomainErrors";

describe("domain errors / usuarios", () => {
  test("UsuarioNoEncontradoError muestra mensaje segun parametro", () => {
    const porUsername = new UsuarioNoEncontradoError("jperez");
    const porId = new UsuarioNoEncontradoError(undefined, "user-001");
    const sinArgs = new UsuarioNoEncontradoError();

    expect(porUsername).toBeInstanceOf(ErrorDeDominio);
    expect(porUsername.message).toContain("jperez");
    expect(porId.message).toContain("user-001");
    expect(sinArgs.message).toBe("Usuario no encontrado.");
  });

  test("EstadoUsuarioInvalidoError tiene codigo y detalle", () => {
    const error = new EstadoUsuarioInvalidoError("ACTIVO");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.codigo).toBe("ESTADO_USUARIO_INVALIDO");
    expect(error.message).toContain("no es valido");
    expect(error.detalle?.estado).toBe("ACTIVO");
    expect(error.name).toBe("EstadoUsuarioInvalidoError");
  });

  test("HashClaveUsuarioInvalidaError tiene codigo por defecto", () => {
    const error = new HashClaveUsuarioInvalidaError();

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.codigo).toBe("HASH_CLAVE_USUARIO_INVALIDA");
    expect(error.message).toContain("hash");
    expect(error.name).toBe("HashClaveUsuarioInvalidaError");
  });

  test("IdUsuarioInvalidoError tiene codigo y detalle id", () => {
    const error = new IdUsuarioInvalidoError("user-001");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.codigo).toBe("ID_USUARIO_INVALIDO");
    expect(error.message).toContain("no es valido");
    expect(error.detalle?.idUsuario).toBe("user-001");
    expect(error.name).toBe("IdUsuarioInvalidoError");
  });

  test("RolDeUsuarioInvalidoError tiene codigo y detalle", () => {
    const error = new RolDeUsuarioInvalidoError("ADMIN");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.codigo).toBe("ROL_USUARIO_INVALIDO");
    expect(error.message).toContain("no es valido");
    expect(error.detalle?.rol).toBe("ADMIN");
    expect(error.name).toBe("RolDeUsuarioInvalidoError");
  });

  test("UsuarioYaDeshabilitadoError tiene codigo y detalle", () => {
    const error = new UsuarioYaDeshabilitadoError("user-001");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.codigo).toBe("USUARIO_YA_DESHABILITADO");
    expect(error.message).toContain("deshabilitado");
    expect(error.detalle?.idUsuario).toBe("user-001");
    expect(error.name).toBe("UsuarioYaDeshabilitadoError");
  });

  test("UsuarioYaExisteError tiene codigo y detalle username", () => {
    const error = new UsuarioYaExisteError("jperez");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.codigo).toBe("USUARIO_YA_EXISTE");
    expect(error.message).toContain("Ya existe");
    expect(error.detalle?.username).toBe("jperez");
    expect(error.name).toBe("UsuarioYaExisteError");
  });
});

describe("domain errors / ventas", () => {
  test("LeadNoEncontradoError tiene mensaje con id", () => {
    const error = new LeadNoEncontradoError("lead-001");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.message).toContain("lead-001");
    expect(error.codigo).toBe("ERROR_DE_DOMINIO");
  });

  test("LeadYaConvertidoError tiene mensaje con id", () => {
    const error = new LeadYaConvertidoError("lead-001");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.message).toContain("lead-001");
    expect(error.message).toContain("convertido");
  });

  test("ClienteNoEncontradoError tiene mensaje con id", () => {
    const error = new ClienteNoEncontradoError("cliente-001");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.message).toContain("cliente-001");
  });

  test("ContratoNoEncontradoError tiene mensaje con id", () => {
    const error = new ContratoNoEncontradoError("cont-001");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.message).toContain("cont-001");
  });

  test("CitaNoEncontradaError tiene mensaje con id", () => {
    const error = new CitaNoEncontradaError("cita-001");

    expect(error).toBeInstanceOf(ErrorDeDominio);
    expect(error.message).toContain("cita-001");
  });
});
