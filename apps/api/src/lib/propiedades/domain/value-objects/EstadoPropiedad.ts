import { PropiedadError } from "../errors/PropiedadError";

export const ESTADOS_PROPIEDAD = [
  "BORRADOR",
  "DISPONIBLE",
  "RESERVADA",
  "VENDIDA",
  "ARCHIVADA",
] as const;
export type ValorEstadoPropiedad = (typeof ESTADOS_PROPIEDAD)[number];

/**
 * Value object que representa el estado comercial de una propiedad.
 *
 * @group Value Objects
 */
export class EstadoPropiedad {
  private readonly valorInterno: ValorEstadoPropiedad;

  private constructor(valor: ValorEstadoPropiedad) {
    this.valorInterno = valor;
  }

  /**
   * Construye un estado valido o lanza {@link PropiedadError} si el valor no es reconocido.
   *
   * @param valor - Estado en string (case-insensitive).
   * @returns Instancia de EstadoPropiedad.
   */
  static desde(valor: string): EstadoPropiedad {
    const normalizado = valor.trim().toUpperCase() as ValorEstadoPropiedad;
    if (!ESTADOS_PROPIEDAD.includes(normalizado)) {
      throw new PropiedadError("El estado de la propiedad no es valido.", "ESTADO_INVALIDO");
    }
    return new EstadoPropiedad(normalizado);
  }

  static borrador = () => new EstadoPropiedad("BORRADOR");
  static disponible = () => new EstadoPropiedad("DISPONIBLE");
  static reservada = () => new EstadoPropiedad("RESERVADA");
  static vendida = () => new EstadoPropiedad("VENDIDA");
  static archivada = () => new EstadoPropiedad("ARCHIVADA");

  get valor(): ValorEstadoPropiedad {
    return this.valorInterno;
  }

  esBorrador(): boolean {
    return this.valorInterno === "BORRADOR";
  }

  esDisponible(): boolean {
    return this.valorInterno === "DISPONIBLE";
  }

  esReservada(): boolean {
    return this.valorInterno === "RESERVADA";
  }

  esVendida(): boolean {
    return this.valorInterno === "VENDIDA";
  }

  esArchivada(): boolean {
    return this.valorInterno === "ARCHIVADA";
  }
}
