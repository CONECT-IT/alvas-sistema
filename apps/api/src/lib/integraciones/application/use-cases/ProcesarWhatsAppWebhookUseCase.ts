import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import {
  CaptacionPendiente,
  CaptacionWhatsApp,
  type ICaptacionPendienteRepository,
} from "../../domain";
import { type CaptacionPendienteDTO, type EntradaWhatsAppWebhookDTO } from "../dto/CaptacionDTOs";
import { captacionPendienteADTO } from "../mappers";
import { type IProcesarWhatsAppWebhook } from "../ports/in";

export class ProcesarWhatsAppWebhookUseCase
  implements
    CasoDeUso<EntradaWhatsAppWebhookDTO, Resultado<CaptacionPendienteDTO, ErrorDeDominio>>,
    IProcesarWhatsAppWebhook
{
  constructor(
    private readonly captacionRepository: ICaptacionPendienteRepository,
    private readonly generadorId: IGeneradorId,
  ) {}

  async ejecutar(
    input: EntradaWhatsAppWebhookDTO,
  ): Promise<Resultado<CaptacionPendienteDTO, ErrorDeDominio>> {
    try {
      const captacion = CaptacionWhatsApp.crear(input).aCaptacion();
      const pendiente = CaptacionPendiente.registrar({
        id: this.generadorId.generar(),
        captacion,
      });

      await this.captacionRepository.guardar(pendiente);

      return resultadoExitoso(captacionPendienteADTO(pendiente));
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }

      throw error;
    }
  }
}
