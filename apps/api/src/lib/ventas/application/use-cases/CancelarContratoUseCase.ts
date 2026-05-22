import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IContratoRepository } from "../../domain/ports/IContratoRepository";
import { type IdContrato } from "../../domain/value-objects/Ids";
import { ErrorDeDominio } from "../../../shared/domain";
import { ContratoNoEncontradoError } from "../../domain/errors/DomainErrors";
import { type ICancelarContrato } from "../ports/in";

export type CancelarContratoInput = {
  idContrato: string;
};

export class CancelarContratoUseCase
  implements CasoDeUso<CancelarContratoInput, Resultado<void, ErrorDeDominio>>, ICancelarContrato
{
  constructor(private readonly contratoRepository: IContratoRepository) {}

  async ejecutar(input: CancelarContratoInput): Promise<Resultado<void, ErrorDeDominio>> {
    try {
      const contrato = await this.contratoRepository.buscarPorId(input.idContrato as IdContrato);
      if (!contrato) {
        return resultadoFallido(new ContratoNoEncontradoError(input.idContrato));
      }

      contrato.cancelar();
      await this.contratoRepository.guardar(contrato);

      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
