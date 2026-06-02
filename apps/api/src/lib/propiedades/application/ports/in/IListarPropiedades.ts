import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Propiedad } from "../../../domain/entities";

/**
 * Consulta para listar propiedades visible segun el rol.
 * @group Puertos
 */
export type ListarPropiedadesQuery = Readonly<{
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
}>;

/**
 * Puerto de entrada para el caso de uso listar propiedades.
 * @group Puertos
 */
export interface IListarPropiedades {
  ejecutar(input: ListarPropiedadesQuery): Promise<Resultado<Propiedad[], ErrorDeDominio>>;
}
