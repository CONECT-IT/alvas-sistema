import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import {
  type CaptacionPendienteDTO,
  type EntradaWhatsAppWebhookDTO,
} from "../../dto/CaptacionDTOs";

/** @group Puertos de Entrada */
export interface IProcesarWhatsAppWebhook {
  ejecutar(
    input: EntradaWhatsAppWebhookDTO,
  ): Promise<Resultado<CaptacionPendienteDTO, ErrorDeDominio>>;
}
