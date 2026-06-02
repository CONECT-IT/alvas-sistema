import { ErrorDeDominio } from "../../../shared/domain";

/** Error emitido cuando username o clave no coinciden. @group Errores */
export class CredencialesInvalidasError extends ErrorDeDominio {
  constructor() {
    super("Las credenciales son invalidas.", {
      codigo: "CREDENCIALES_INVALIDAS",
    });
    this.name = "CredencialesInvalidasError";
  }
}
