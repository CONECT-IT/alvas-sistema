/**
 * Puerto de autorizacion para operaciones sobre propiedades.
 *
 * @group Puertos
 */
export interface IAutorizadorPropiedades {
  puedeVerPropiedades(rol: string): boolean;
  puedeGestionarPropiedades(rol: string): boolean;
  puedeEditarPropiedadRelacionada(rol: string): boolean;
}
