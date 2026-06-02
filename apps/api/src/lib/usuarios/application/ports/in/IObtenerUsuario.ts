import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type UsuarioOutputDTO } from "../../dto/UsuarioActualizacionDTOs";

export type ObtenerUsuarioQuery = Readonly<{
  idUsuario: string;
}>;

/** Puerto de entrada para obtener un usuario por id. @group Puertos de Entrada */
export interface IObtenerUsuario {
  ejecutar(input: ObtenerUsuarioQuery): Promise<Resultado<UsuarioOutputDTO, ErrorDeDominio>>;
}
