import { ErrorDeValidacion } from "../../../shared/domain";

export const ESTADOS_CAPTACION = [
  "PENDIENTE",
  "REVISADA",
  "DUPLICADA",
  "CONVERTIDA",
  "RECHAZADA",
] as const;

export type ValorEstadoCaptacion = (typeof ESTADOS_CAPTACION)[number];

export class EstadoCaptacion {
  private readonly valorInterno: ValorEstadoCaptacion;

  private constructor(valor: ValorEstadoCaptacion) {
    this.valorInterno = valor;
  }

  static desde(valor: string): EstadoCaptacion {
    const normalizado = valor.trim().toUpperCase() as ValorEstadoCaptacion;
    if (!ESTADOS_CAPTACION.includes(normalizado)) {
      throw new ErrorDeValidacion("El estado de la captacion no es valido.");
    }
    return new EstadoCaptacion(normalizado);
  }

  static pendiente = () => new EstadoCaptacion("PENDIENTE");
  static revisada = () => new EstadoCaptacion("REVISADA");
  static duplicada = () => new EstadoCaptacion("DUPLICADA");
  static convertida = () => new EstadoCaptacion("CONVERTIDA");
  static rechazada = () => new EstadoCaptacion("RECHAZADA");

  get valor(): ValorEstadoCaptacion {
    return this.valorInterno;
  }

  esPendiente(): boolean {
    return this.valorInterno === "PENDIENTE";
  }
}
