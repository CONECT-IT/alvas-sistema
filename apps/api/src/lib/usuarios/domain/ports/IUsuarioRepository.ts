import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Usuario } from "../entities";
import { Username } from "../value-objects";

/** Puerto repositorio para persistencia de usuarios. @group Puertos */
export interface IUsuarioRepository
  extends IRepositorioLectura<Usuario, string>, IRepositorioEscritura<Usuario, string> {
  listar(): Promise<Usuario[]>;
  obtenerPorUsername(username: Username): Promise<Usuario | null>;
  existePorUsername(username: Username): Promise<boolean>;
}
