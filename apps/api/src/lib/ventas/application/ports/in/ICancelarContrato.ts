import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";

export type CancelarContratoCommand = Readonly<{
  idContrato: string;
}>;

export interface ICancelarContrato {
  ejecutar(input: CancelarContratoCommand): Promise<Resultado<void, ErrorDeDominio>>;
}
