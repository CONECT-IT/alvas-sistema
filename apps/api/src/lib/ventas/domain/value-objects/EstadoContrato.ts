import { ErrorDeValidacion } from "../../../shared/domain";

export const ESTADOS_CONTRATO = ["BORRADOR", "VIGENTE", "FINALIZADO", "CANCELADO"] as const;

export type ValorEstadoContrato = (typeof ESTADOS_CONTRATO)[number];

/** @group Value Objects */
export class EstadoContrato {
  private readonly valorInterno: ValorEstadoContrato;

  private constructor(valor: ValorEstadoContrato) {
    this.valorInterno = valor;
  }

  static desde(valor: string): EstadoContrato {
    const valorNormalizado = valor.trim().toUpperCase();
    if (!ESTADOS_CONTRATO.includes(valorNormalizado as ValorEstadoContrato)) {
      throw new ErrorDeValidacion(`Estado de contrato inválido: ${valor}`);
    }
    return new EstadoContrato(valorNormalizado as ValorEstadoContrato);
  }

  static borrador = () => new EstadoContrato("BORRADOR");
  static vigente = () => new EstadoContrato("VIGENTE");
  static finalizado = () => new EstadoContrato("FINALIZADO");
  static cancelado = () => new EstadoContrato("CANCELADO");

  get valor(): ValorEstadoContrato {
    return this.valorInterno;
  }

  esBorrador(): boolean {
    return this.valorInterno === "BORRADOR";
  }

  esVigente(): boolean {
    return this.valorInterno === "VIGENTE";
  }

  esFinalizado(): boolean {
    return this.valorInterno === "FINALIZADO";
  }

  esCancelado(): boolean {
    return this.valorInterno === "CANCELADO";
  }
}
