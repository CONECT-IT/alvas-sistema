import { ErrorDeDominio, type DetalleErrorDeDominio } from "./ErrorDeDominio";

/**
 * Error de validacion de datos. Indica que la entrada no cumple reglas del negocio.
 *
 * @group Errores
 */
export class ErrorDeValidacion extends ErrorDeDominio {
  /**
   * @param mensaje - Descripcion del error de validacion.
   * @param detalle - Mapa opcional con campos que fallaron validacion.
   */
  constructor(mensaje: string, detalle?: DetalleErrorDeDominio) {
    super(mensaje, {
      codigo: "ERROR_DE_VALIDACION",
      detalle,
    });
    this.name = "ErrorDeValidacion";
  }
}
