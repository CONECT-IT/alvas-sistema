import { ErrorDeDominio } from "../../../shared/domain";

/** Error emitido al intentar crear un usuario con username existente. @group Errores */
export class UsuarioYaExisteError extends ErrorDeDominio {
  constructor(username: string) {
    super("Ya existe un usuario con ese username.", {
      codigo: "USUARIO_YA_EXISTE",
      detalle: { username },
    });
    this.name = "UsuarioYaExisteError";
  }
}
