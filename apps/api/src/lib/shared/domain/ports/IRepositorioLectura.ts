/**
 * Puerto de lectura para repositorios del dominio.
 *
 * @group Puertos
 */
export interface IRepositorioLectura<TEntidad, TId> {
  obtenerPorId(id: TId): Promise<TEntidad | null>;
  existePorId(id: TId): Promise<boolean>;
}
