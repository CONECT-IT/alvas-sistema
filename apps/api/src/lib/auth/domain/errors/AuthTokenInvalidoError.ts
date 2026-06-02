import { ErrorDeDominio } from "../../../shared/domain";

/** Error emitido cuando el auth token es invalido o expiro. @group Errores */
export class AuthTokenInvalidoError extends ErrorDeDominio {
  constructor() {
    super("El auth token es invalido.", {
      codigo: "AUTH_TOKEN_INVALIDO",
    });
    this.name = "AuthTokenInvalidoError";
  }
}
