import { ErrorDeValidacion } from "../../../shared/domain";

/** Nombre completo del usuario (2-100 caracteres). @group Value Objects */
export class Nombre {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const nombreNormalizado = valor.trim();

    if (nombreNormalizado.length < 2) {
      throw new ErrorDeValidacion("El nombre debe tener al menos 2 caracteres.");
    }

    if (nombreNormalizado.length > 100) {
      throw new ErrorDeValidacion("El nombre no puede exceder los 100 caracteres.");
    }

    this.valorInterno = nombreNormalizado;
  }

  get valor(): string {
    return this.valorInterno;
  }

  toString(): string {
    return this.valorInterno;
  }
}
