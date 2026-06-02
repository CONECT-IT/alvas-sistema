import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type CaptacionPendienteDTO } from "../../dto/CaptacionDTOs";

/** @group Puertos de Entrada */
export interface IListarCaptacionesPendientes {
  ejecutar(): Promise<Resultado<CaptacionPendienteDTO[], ErrorDeDominio>>;
}
