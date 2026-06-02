import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Resultado } from "../../../../shared";
import { type SesionAutenticadaDTO } from "../../dto";

/** Puerto de entrada para el caso de uso iniciar sesion. @group Puertos de Entrada */
export type IniciarSesionCommand = Readonly<{
  username: string;
  clave: string;
}>;

export interface IIniciarSesion {
  ejecutar(input: IniciarSesionCommand): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>>;
}
