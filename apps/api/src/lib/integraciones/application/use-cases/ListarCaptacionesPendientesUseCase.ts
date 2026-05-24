import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type ICaptacionPendienteRepository } from "../../domain";
import { type CaptacionPendienteDTO } from "../dto/CaptacionDTOs";
import { captacionPendienteADTO } from "../mappers";
import { type IListarCaptacionesPendientes } from "../ports/in";

export class ListarCaptacionesPendientesUseCase
  implements
    CasoDeUso<void, Resultado<CaptacionPendienteDTO[], ErrorDeDominio>>,
    IListarCaptacionesPendientes
{
  constructor(private readonly captacionRepository: ICaptacionPendienteRepository) {}

  async ejecutar(): Promise<Resultado<CaptacionPendienteDTO[], ErrorDeDominio>> {
    try {
      const captaciones = await this.captacionRepository.listarPendientes();
      return resultadoExitoso(captaciones.map(captacionPendienteADTO));
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }

      throw error;
    }
  }
}
