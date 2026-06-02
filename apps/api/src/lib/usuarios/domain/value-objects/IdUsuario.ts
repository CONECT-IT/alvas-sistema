import { IdUsuarioInvalidoError } from "../errors";

/** Identificador unico de usuario. @group Value Objects */
export class IdUsuario {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const idNormalizado = valor.trim();

    if (idNormalizado.length < 5) {
      throw new IdUsuarioInvalidoError(valor);
    }

    this.valorInterno = idNormalizado;
  }

  get valor(): string {
    return this.valorInterno;
  }

  esIgual(otro: IdUsuario): boolean {
    return this.valorInterno === otro.valorInterno;
  }

  toString(): string {
    return this.valorInterno;
  }
}
