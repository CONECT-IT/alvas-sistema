/**
 * Puerto para generacion de identificadores unicos.
 *
 * @group Puertos
 */
export interface IGeneradorId {
  generar(): string;
}
