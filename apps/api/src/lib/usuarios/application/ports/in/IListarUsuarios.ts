import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type UsuarioListadoOutputDTO } from "../../dto/UsuarioListadoDTOs";

/** Puerto de entrada para listar todos los usuarios. @group Puertos de Entrada */
export interface IListarUsuarios {
  ejecutar(): Promise<Resultado<UsuarioListadoOutputDTO[], ErrorDeDominio>>;
}
