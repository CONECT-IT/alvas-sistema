import { ErrorDeDominio } from "../../../shared/domain";

/** Error emitido cuando el id de usuario no es valido. @group Errores */
export class IdUsuarioInvalidoError extends ErrorDeDominio {
  constructor(idUsuario: string) {
    super("El id del usuario no es valido.", {
      codigo: "ID_USUARIO_INVALIDO",
      detalle: { idUsuario },
    });
    this.name = "IdUsuarioInvalidoError";
  }
}
