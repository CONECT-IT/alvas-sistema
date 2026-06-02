/**
 * Puerto de escritura para repositorios del dominio.
 *
 * @group Puertos
 */
export interface IRepositorioEscritura<TEntidad, TId> {
  guardar(entidad: TEntidad): Promise<void>;
  eliminarPorId(id: TId): Promise<void>;
}
