import { type IRepositorioEscritura, type IRepositorioLectura } from "../../../shared/domain";
import { Propiedad } from "../entities/Propiedad";

export interface IPropiedadRepository
  extends
    IRepositorioLectura<Propiedad, string>,
    IRepositorioEscritura<Propiedad, string> {
  listarTodas(): Promise<Propiedad[]>;
}
