import { ErrorDeValidacion } from "../../../shared/domain";

/** Token de autenticacion firmado con HMAC. @group Value Objects */
export class AuthToken {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const token = valor.trim();

    if (!token) {
      throw new ErrorDeValidacion("El auth token no puede estar vacio.");
    }

    this.valorInterno = token;
  }

  get valor(): string {
    return this.valorInterno;
  }
}
