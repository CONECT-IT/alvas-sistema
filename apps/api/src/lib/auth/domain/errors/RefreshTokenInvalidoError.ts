import { ErrorDeDominio } from "../../../shared/domain";

/** Error emitido cuando el refresh token es invalido o expiro. @group Errores */
export class RefreshTokenInvalidoError extends ErrorDeDominio {
  constructor() {
    super("El refresh token es invalido.", {
      codigo: "REFRESH_TOKEN_INVALIDO",
    });
    this.name = "RefreshTokenInvalidoError";
  }
}
