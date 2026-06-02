export type DetalleErrorDeDominio = Readonly<Record<string, unknown>>;

type ErrorDeDominioParams = {
  codigo?: string;
  detalle?: DetalleErrorDeDominio;
};

/**
 * Error base del dominio. Todos los errores de negocio heredan de esta clase.
 *
 * @group Errores
 */
export class ErrorDeDominio extends Error {
  public readonly codigo: string;
  public readonly detalle?: DetalleErrorDeDominio;

  /**
   * @param mensaje - Descripcion del error.
   * @param params - Configuracion opcional con codigo y detalle adicional.
   */
  constructor(mensaje: string, params?: ErrorDeDominioParams) {
    super(mensaje);
    this.name = "ErrorDeDominio";
    this.codigo = params?.codigo ?? "ERROR_DE_DOMINIO";
    this.detalle = params?.detalle;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
