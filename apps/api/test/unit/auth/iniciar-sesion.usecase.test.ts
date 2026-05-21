import { describe, expect, test } from "bun:test";

import { IniciarSesionUseCase } from "../../../src/lib/auth/application/use-cases/IniciarSesionUseCase";
import { RenovarSesionUseCase } from "../../../src/lib/auth/application/use-cases/RenovarSesionUseCase";
import {
  type CredencialesUsuario,
  type IConsultaCredencialesUsuario,
  type ITokenProvider,
  type IVerificadorDeClave,
} from "../../../src/lib/auth/domain/ports";
import { AuthToken, RefreshToken } from "../../../src/lib/auth/domain/value-objects";
import { type SessionClaims } from "../../../src/lib/shared/infrastructure/session";
import { ErrorDeDominio } from "../../../src/lib/shared/domain/errors/ErrorDeDominio";

class FakeConsultaCredenciales implements IConsultaCredencialesUsuario {
  constructor(private readonly usuario: CredencialesUsuario | null) {}

  async buscarPorId(): Promise<CredencialesUsuario | null> {
    return this.usuario;
  }

  async buscarPorUsername(username: string): Promise<CredencialesUsuario | null> {
    return this.usuario?.username === username ? this.usuario : null;
  }
}

class FakeVerificadorDeClave implements IVerificadorDeClave {
  constructor(private readonly coincide: boolean) {}

  async comparar(): Promise<boolean> {
    return this.coincide;
  }
}

class FakeTokenProvider implements ITokenProvider {
  generarAuthToken(): AuthToken {
    return new AuthToken("auth-token");
  }

  generarRefreshToken(): RefreshToken {
    return new RefreshToken("refresh-token");
  }

  validarAuthToken(): SessionClaims {
    return { idUsuario: "user-001", rol: "ASESOR" };
  }

  validarRefreshToken(): SessionClaims {
    return { idUsuario: "user-001", rol: "ASESOR" };
  }
}

describe("auth / IniciarSesionUseCase", () => {
  test("emite tokens para credenciales validas", async () => {
    const resultado = await new IniciarSesionUseCase(
      new FakeConsultaCredenciales({
        idUsuario: "user-001",
        username: "asesor1",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
        estado: "ACTIVO",
      }),
      new FakeVerificadorDeClave(true),
      new FakeTokenProvider(),
    ).ejecutar({ username: " Asesor1 ", clave: " secreto " });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.authToken).toBe("auth-token");
      expect(resultado.valor.usuario.username).toBe("asesor1");
    }
  });

  test("rechaza usuarios deshabilitados", async () => {
    const resultado = await new IniciarSesionUseCase(
      new FakeConsultaCredenciales({
        idUsuario: "user-001",
        username: "asesor1",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
        estado: "DESHABILITADO",
      }),
      new FakeVerificadorDeClave(true),
      new FakeTokenProvider(),
    ).ejecutar({ username: "asesor1", clave: "secreto" });

    expect(resultado.esExito).toBe(false);
  });

  test("propaga errores no dominio en IniciarSesionUseCase", async () => {
    const credenciales = new FakeConsultaCredenciales({
      idUsuario: "user-001",
      username: "asesor1",
      hashClave: "hash-seguro-001",
      rol: "ASESOR",
      estado: "ACTIVO",
    });
    credenciales.buscarPorUsername = () => Promise.reject(new Error("db error"));

    await expect(
      new IniciarSesionUseCase(
        credenciales,
        new FakeVerificadorDeClave(true),
        new FakeTokenProvider(),
      ).ejecutar({ username: "asesor1", clave: "secreto" }),
    ).rejects.toThrow("db error");
  });

  test("captura ErrorDeDominio como resultadoFallido en IniciarSesionUseCase", async () => {
    const credenciales = new FakeConsultaCredenciales({
      idUsuario: "user-001",
      username: "asesor1",
      hashClave: "hash-seguro-001",
      rol: "ASESOR",
      estado: "ACTIVO",
    });
    credenciales.buscarPorUsername = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new IniciarSesionUseCase(
      credenciales,
      new FakeVerificadorDeClave(true),
      new FakeTokenProvider(),
    ).ejecutar({ username: "asesor1", clave: "secreto" });

    expect(resultado.esExito).toBe(false);
  });
});

describe("auth / RenovarSesionUseCase", () => {
  test("renueva tokens para refresh token valido y usuario activo", async () => {
    const tokenProvider = new FakeTokenProvider();

    const resultado = await new RenovarSesionUseCase(
      new FakeConsultaCredenciales({
        idUsuario: "user-001",
        username: "asesor1",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
        estado: "ACTIVO",
      }),
      tokenProvider,
    ).ejecutar({ refreshToken: " refresh-token " });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.authToken).toBe("auth-token");
      expect(resultado.valor.refreshToken).toBe("refresh-token");
      expect(resultado.valor.usuario).toEqual({
        id: "user-001",
        username: "asesor1",
        rol: "ASESOR",
      });
    }
  });

  test("rechaza renovacion si usuario no existe o esta deshabilitado", async () => {
    const tokenProvider = new FakeTokenProvider();
    const usuarioInexistente = await new RenovarSesionUseCase(
      new FakeConsultaCredenciales(null),
      tokenProvider,
    ).ejecutar({ refreshToken: "refresh-token" });
    const usuarioDeshabilitado = await new RenovarSesionUseCase(
      new FakeConsultaCredenciales({
        idUsuario: "user-001",
        username: "asesor1",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
        estado: "DESHABILITADO",
      }),
      tokenProvider,
    ).ejecutar({ refreshToken: "refresh-token" });

    expect(usuarioInexistente.esExito).toBe(false);
    expect(usuarioDeshabilitado.esExito).toBe(false);
  });

  test("propaga errores no dominio en RenovarSesionUseCase", async () => {
    const credenciales = new FakeConsultaCredenciales({
      idUsuario: "user-001",
      username: "asesor1",
      hashClave: "hash-seguro-001",
      rol: "ASESOR",
      estado: "ACTIVO",
    });
    credenciales.buscarPorId = () => Promise.reject(new Error("db error"));

    await expect(
      new RenovarSesionUseCase(credenciales, new FakeTokenProvider()).ejecutar({
        refreshToken: "refresh-token",
      }),
    ).rejects.toThrow("db error");
  });

  test("captura ErrorDeDominio como resultadoFallido en RenovarSesionUseCase", async () => {
    const credenciales = new FakeConsultaCredenciales({
      idUsuario: "user-001",
      username: "asesor1",
      hashClave: "hash-seguro-001",
      rol: "ASESOR",
      estado: "ACTIVO",
    });
    credenciales.buscarPorId = () => Promise.reject(new ErrorDeDominio("error dominio"));

    const resultado = await new RenovarSesionUseCase(
      credenciales,
      new FakeTokenProvider(),
    ).ejecutar({
      refreshToken: "refresh-token",
    });

    expect(resultado.esExito).toBe(false);
  });
});
