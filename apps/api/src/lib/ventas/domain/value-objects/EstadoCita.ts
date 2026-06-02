import { ErrorDeValidacion } from "../../../shared/domain";

export const ESTADOS_CITA = ["PENDIENTE", "REALIZADA", "CANCELADA", "REPROGRAMADA"] as const;
export type ValorEstadoCita = (typeof ESTADOS_CITA)[number];

/** @group Value Objects */
export class EstadoCita {
  private readonly valorInterno: ValorEstadoCita;

  private constructor(valor: ValorEstadoCita) {
    this.valorInterno = valor;
  }

  static desde(valor: string): EstadoCita {
    const normalizado = valor.trim().toUpperCase() as ValorEstadoCita;
    if (!ESTADOS_CITA.includes(normalizado)) {
      throw new ErrorDeValidacion(`Estado de cita inválido: ${valor}`);
    }
    return new EstadoCita(normalizado);
  }

  static pendiente = () => new EstadoCita("PENDIENTE");
  static realizada = () => new EstadoCita("REALIZADA");
  static cancelada = () => new EstadoCita("CANCELADA");
  static reprogramada = () => new EstadoCita("REPROGRAMADA");

  get valor(): ValorEstadoCita {
    return this.valorInterno;
  }

  esPendiente(): boolean {
    return this.valorInterno === "PENDIENTE";
  }

  esRealizada(): boolean {
    return this.valorInterno === "REALIZADA";
  }

  esCancelada(): boolean {
    return this.valorInterno === "CANCELADA";
  }

  esReprogramada(): boolean {
    return this.valorInterno === "REPROGRAMADA";
  }
}
