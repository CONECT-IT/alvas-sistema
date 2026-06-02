import { ErrorDeValidacion } from "../../../shared/domain";

export const ESTADOS_LEAD = [
  "NUEVO",
  "CONTACTO",
  "AGENDADO",
  "TRABAJANDO",
  "CONVERTIDO",
  "PERDIDO",
] as const;

export type ValorEstadoLead = (typeof ESTADOS_LEAD)[number];

/** @group Value Objects */
export class EstadoLead {
  private readonly valorInterno: ValorEstadoLead;

  private constructor(valor: ValorEstadoLead) {
    this.valorInterno = valor;
  }

  static desde(valor: string): EstadoLead {
    const valorNormalizado = valor.trim().toUpperCase();
    if (!ESTADOS_LEAD.includes(valorNormalizado as ValorEstadoLead)) {
      throw new ErrorDeValidacion(`Estado de lead inválido: ${valor}`);
    }
    return new EstadoLead(valorNormalizado as ValorEstadoLead);
  }

  static nuevo = () => new EstadoLead("NUEVO");
  static contacto = () => new EstadoLead("CONTACTO");
  static agendado = () => new EstadoLead("AGENDADO");
  static trabajando = () => new EstadoLead("TRABAJANDO");
  static convertido = () => new EstadoLead("CONVERTIDO");
  static perdido = () => new EstadoLead("PERDIDO");

  get valor(): ValorEstadoLead {
    return this.valorInterno;
  }

  estaCerrado(): boolean {
    return this.esConvertido() || this.esPerdido();
  }

  esConvertido(): boolean {
    return this.valorInterno === "CONVERTIDO";
  }

  esPerdido(): boolean {
    return this.valorInterno === "PERDIDO";
  }

  esNuevo(): boolean {
    return this.valorInterno === "NUEVO";
  }

  esContacto(): boolean {
    return this.valorInterno === "CONTACTO";
  }

  esAgendado(): boolean {
    return this.valorInterno === "AGENDADO";
  }

  esTrabajando(): boolean {
    return this.valorInterno === "TRABAJANDO";
  }
}
