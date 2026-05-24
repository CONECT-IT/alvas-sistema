import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type CaptacionPendienteDTO } from "../../dto/CaptacionDTOs";

export interface IListarCaptacionesPendientes {
  ejecutar(): Promise<Resultado<CaptacionPendienteDTO[], ErrorDeDominio>>;
}
