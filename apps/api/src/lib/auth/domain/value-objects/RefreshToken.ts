import { RefreshTokenInvalidoError } from "../errors";

/** Token de refresco para renovar sesion expirada. @group Value Objects */
export class RefreshToken {
  private readonly valorInterno: string;

  constructor(valor: string) {
    const token = valor.trim();

    if (!token) {
      throw new RefreshTokenInvalidoError();
    }

    this.valorInterno = token;
  }

  get valor(): string {
    return this.valorInterno;
  }
}
