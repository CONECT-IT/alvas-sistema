import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type IPasswordHasher, type IUsuarioRepository } from "../../domain/ports";
import { IdUsuario } from "../../domain/value-objects";
import { type ActualizarUsuarioInputDTO } from "../dto/UsuarioActualizacionDTOs";
import { type UsuarioOutputDTO } from "../dto/UsuarioActualizacionDTOs";
import { type IActualizarUsuario } from "../ports/in";

export type ActualizarUsuarioInput = ActualizarUsuarioInputDTO;
export type ActualizarUsuarioOutput = UsuarioOutputDTO;

export class ActualizarUsuarioUseCase
  implements
    CasoDeUso<ActualizarUsuarioInput, Resultado<ActualizarUsuarioOutput, ErrorDeDominio>>,
    IActualizarUsuario
{
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHasher?: IPasswordHasher,
  ) {}

  async ejecutar(
    input: ActualizarUsuarioInput,
  ): Promise<Resultado<ActualizarUsuarioOutput, ErrorDeDominio>> {
    try {
      const usuario = await this.usuarioRepository.obtenerPorId(new IdUsuario(input.idUsuario));
      if (!usuario) {
        return resultadoFallido(
          new ErrorDeDominio("Usuario no encontrado", { codigo: "USER_NOT_FOUND" }),
        );
      }

      if (input.nombre) {
        usuario.cambiarNombre(input.nombre);
      }

      if (input.username) {
        usuario.cambiarUsername(input.username);
      }

      if (input.clave) {
        if (!this.passwordHasher) {
          return resultadoFallido(
            new ErrorDeDominio("No se puede actualizar la clave sin hasher configurado", {
              codigo: "PASSWORD_HASHER_NO_CONFIGURADO",
            }),
          );
        }

        const hashClave = await this.passwordHasher.hashear(input.clave);
        usuario.cambiarHashClave(hashClave.valor);
      }

      if (input.rol) {
        usuario.cambiarRol(input.rol);
      }

      if (input.estado) {
        const estado = input.estado.toUpperCase();
        if (estado === "ACTIVO") {
          usuario.activar();
        } else if (estado === "DESHABILITADO" || estado === "INACTIVO") {
          usuario.deshabilitar();
        }
      }

      await this.usuarioRepository.guardar(usuario);

      const output: UsuarioOutputDTO = {
        id: usuario.id.valor,
        username: usuario.username.valor,
        nombre: usuario.nombre.valor,
        rol: usuario.rol.valor,
        estado: usuario.estado.valor,
        creadoEn: usuario.creadoEn.toISOString(),
        actualizadoEn: usuario.actualizadoEn.toISOString(),
      };

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
