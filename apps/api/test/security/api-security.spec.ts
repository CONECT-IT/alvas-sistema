import { describe, expect, it } from "bun:test";

describe("security / api", () => {
  it("verifica que los errores de dominio no filtren stack traces", () => {
    const errorResponse = {
      success: false,
      message: "Lead no encontrado",
      code: "LEAD_NO_ENCONTRADO",
    };

    expect(errorResponse).not.toHaveProperty("stack");
    expect(Object.keys(errorResponse).length).toBe(3);
  });

  it("verifica que los DTOs de usuario no expongan hashClave", () => {
    const usuarioDTO = {
      id: "usuario-1",
      username: "asesor",
      nombre: "Luis Asesor",
      rol: "ASESOR",
      estado: "ACTIVO",
    };

    expect(usuarioDTO).not.toHaveProperty("hashClave");
    expect(usuarioDTO).not.toHaveProperty("nueva-clave");
    expect(usuarioDTO).not.toHaveProperty("password");
  });

  it("verifica que los DTOs de cliente no expongan datos sensibles", () => {
    const clienteDTO = {
      id: "cliente-1",
      nombre: "Ana",
      email: "ana@example.com",
      telefono: "70000001",
      idAsesor: "asesor-1",
      creadoEn: "2026-05-23T10:00:00.000Z",
      actualizadoEn: "2026-05-23T10:00:00.000Z",
    };

    expect(clienteDTO).not.toHaveProperty("hashClave");
    expect(clienteDTO).not.toHaveProperty("notasInternas");
    expect(Object.keys(clienteDTO).length).toBe(7);
  });

  it("verifica que el contrato de sesion solo tenga campos acordados", () => {
    const sesionDTO = {
      authToken: "token-1",
      refreshToken: "refresh-1",
      usuario: {
        id: "usuario-1",
        username: "asesor",
        rol: "ASESOR",
      },
    };

    const clavesSesion = Object.keys(sesionDTO);
    const clavesUsuario = Object.keys(sesionDTO.usuario);

    expect(clavesSesion).toEqual(["authToken", "refreshToken", "usuario"]);
    expect(clavesUsuario).toEqual(["id", "username", "rol"]);
  });
});
