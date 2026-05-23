import { PropiedadError } from "../errors/PropiedadError";

export const ESTADOS_PROPIEDAD = [
  "PRELIMINAR",
  "EN_VALIDACION",
  "DISPONIBLE",
  "RESERVADA",
  "VENDIDA",
  "DESCARTADA",
] as const;
export type ValorEstadoPropiedad = (typeof ESTADOS_PROPIEDAD)[number];

export class EstadoPropiedad {
  private readonly valorInterno: ValorEstadoPropiedad;

  private constructor(valor: ValorEstadoPropiedad) {
    this.valorInterno = valor;
  }

  static desde(valor: string): EstadoPropiedad {
    const normalizado = valor.trim().toUpperCase() as ValorEstadoPropiedad;
    if (!ESTADOS_PROPIEDAD.includes(normalizado)) {
      throw new PropiedadError("El estado de la propiedad no es valido.", "ESTADO_INVALIDO");
    }
    return new EstadoPropiedad(normalizado);
  }

  static preliminar = () => new EstadoPropiedad("PRELIMINAR");
  static enValidacion = () => new EstadoPropiedad("EN_VALIDACION");
  static disponible = () => new EstadoPropiedad("DISPONIBLE");
  static reservada = () => new EstadoPropiedad("RESERVADA");
  static vendida = () => new EstadoPropiedad("VENDIDA");
  static descartada = () => new EstadoPropiedad("DESCARTADA");

  get valor(): ValorEstadoPropiedad {
    return this.valorInterno;
  }

  esPreliminar(): boolean {
    return this.valorInterno === "PRELIMINAR";
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
}
