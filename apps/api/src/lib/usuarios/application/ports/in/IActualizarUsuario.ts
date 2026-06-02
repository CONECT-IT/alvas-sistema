import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import {
  type ActualizarUsuarioInputDTO,
  type UsuarioOutputDTO,
} from "../../dto/UsuarioActualizacionDTOs";

/** Puerto de entrada para actualizar un usuario. @group Puertos de Entrada */
export interface IActualizarUsuario {
  ejecutar(input: ActualizarUsuarioInputDTO): Promise<Resultado<UsuarioOutputDTO, ErrorDeDominio>>;
}
