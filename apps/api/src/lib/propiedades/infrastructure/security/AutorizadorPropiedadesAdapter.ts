import { type IAutorizadorPropiedades } from "../../domain/ports";

/**
 * Adaptador de autorizacion que implementa las reglas de permisos por rol.
 *
 * @group Seguridad
 */
export class AutorizadorPropiedadesAdapter implements IAutorizadorPropiedades {
  puedeVerPropiedades(rol: string): boolean {
    return rol === "ADMIN" || rol === "ASESOR";
  }

  puedeGestionarPropiedades(rol: string): boolean {
    return rol === "ADMIN";
  }

  puedeEditarPropiedadRelacionada(rol: string): boolean {
    return rol === "ADMIN" || rol === "ASESOR";
  }
}
