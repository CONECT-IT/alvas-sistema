import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Resultado } from "../../../../shared";
import { type SesionAutenticadaDTO } from "../../dto";

/** Puerto de entrada para el caso de uso renovar sesion. @group Puertos de Entrada */
export type RenovarSesionCommand = Readonly<{
  refreshToken: string;
}>;

export interface IRenovarSesion {
  ejecutar(input: RenovarSesionCommand): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>>;
}
