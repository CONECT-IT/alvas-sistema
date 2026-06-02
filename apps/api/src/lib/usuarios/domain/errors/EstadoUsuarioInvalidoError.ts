import { ErrorDeDominio } from "../../../shared/domain";

/** Error emitido cuando el estado del usuario no es valido. @group Errores */
export class EstadoUsuarioInvalidoError extends ErrorDeDominio {
  constructor(estado: string) {
    super("El estado del usuario no es valido.", {
      codigo: "ESTADO_USUARIO_INVALIDO",
      detalle: { estado },
    });
    this.name = "EstadoUsuarioInvalidoError";
  }
}
