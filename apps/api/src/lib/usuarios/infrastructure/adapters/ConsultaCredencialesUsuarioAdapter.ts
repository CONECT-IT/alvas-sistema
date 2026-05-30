import { type IConsultaCredencialesUsuario } from "../../../auth/domain";
import { type IUsuarioRepository } from "../../domain/ports";
import { Username } from "../../domain/value-objects";

export class ConsultaCredencialesUsuarioAdapter implements IConsultaCredencialesUsuario {
  constructor(private readonly usuarioRepo: IUsuarioRepository) {}

  async buscarPorId(idUsuario: string) {
    try {
      const usuario = await this.usuarioRepo.obtenerPorId(idUsuario);

      if (!usuario) {
        return null;
      }

      return {
        idUsuario: usuario.id.valor,
        username: usuario.username.valor,
        hashClave: usuario.hashClave.valor,
        rol: usuario.rol.valor,
        estado: usuario.estado.valor,
      };
    } catch {
      console.warn(
        `ConsultaCredencialesUsuarioAdapter: Error al buscar usuario por id ${idUsuario}`,
      );
      return null;
    }
  }

  async buscarPorUsername(username: string) {
    try {
      const usuario = await this.usuarioRepo.obtenerPorUsername(new Username(username));

      if (!usuario) {
        return null;
      }

      return {
        idUsuario: usuario.id.valor,
        username: usuario.username.valor,
        hashClave: usuario.hashClave.valor,
        rol: usuario.rol.valor,
        estado: usuario.estado.valor,
      };
    } catch {
      console.warn(
        `ConsultaCredencialesUsuarioAdapter: Error al buscar usuario por username ${username}`,
      );
      return null;
    }
  }
}
