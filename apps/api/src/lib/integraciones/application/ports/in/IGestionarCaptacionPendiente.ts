import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import {
  type CaptacionConvertidaDTO,
  type CaptacionPendienteDTO,
  type ConvertirCaptacionPendienteDTO,
  type MarcarCaptacionDuplicadaDTO,
  type RechazarCaptacionPendienteDTO,
  type RevisarCaptacionPendienteDTO,
} from "../../dto/CaptacionDTOs";

/** @group Puertos de Entrada */
export interface IRevisarCaptacionPendiente {
  ejecutar(
    input: RevisarCaptacionPendienteDTO,
  ): Promise<Resultado<CaptacionPendienteDTO, ErrorDeDominio>>;
}

export interface IMarcarCaptacionDuplicada {
  ejecutar(
    input: MarcarCaptacionDuplicadaDTO,
  ): Promise<Resultado<CaptacionPendienteDTO, ErrorDeDominio>>;
}

export interface IRechazarCaptacionPendiente {
  ejecutar(
    input: RechazarCaptacionPendienteDTO,
  ): Promise<Resultado<CaptacionPendienteDTO, ErrorDeDominio>>;
}

export interface IConvertirCaptacionPendiente {
  ejecutar(
    input: ConvertirCaptacionPendienteDTO,
  ): Promise<Resultado<CaptacionConvertidaDTO, ErrorDeDominio>>;
}
