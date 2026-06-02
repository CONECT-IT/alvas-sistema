import { ErrorDeDominio } from "../../../shared/domain";

/**
 * Error de dominio del modulo Propiedades. Indica una violacion de regla de negocio.
 *
 * @group Errores
 */
export class PropiedadError extends ErrorDeDominio {
  constructor(message: string, codigo: string) {
    super(message, { codigo, detalle: { contexto: "PROPIEDADES" } });
  }
}
