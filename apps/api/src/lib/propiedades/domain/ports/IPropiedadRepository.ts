import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Propiedad } from "../entities/Propiedad";

/**
 * Puerto del repositorio de propiedades.
 *
 * @group Puertos
 */
export interface IPropiedadRepository
  extends IRepositorioLectura<Propiedad, string>, IRepositorioEscritura<Propiedad, string> {
  listarTodas(): Promise<Propiedad[]>;
}
