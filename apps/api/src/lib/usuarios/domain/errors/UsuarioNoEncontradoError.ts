import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";

/** Error emitido cuando no se encuentra un usuario por id o username. @group Errores */
export class UsuarioNoEncontradoError extends ErrorDeDominio {
  constructor(username?: string, id?: string) {
    if (username) {
      super(`El usuario con username ${username} no ha sido encontrado.`);
    } else if (id) {
      super(`El usuario con id ${id} no ha sido encontrado.`);
    } else {
      super("Usuario no encontrado.");
    }
  }
}
