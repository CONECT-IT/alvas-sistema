import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { idLead } from "../../domain/value-objects/Ids";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IListarActividadLead } from "../ports/in";
import { type ActividadLeadDTO } from "../dto/LeadDTOs";

export type ListarActividadLeadInput = {
  idLead: string;
};

export type ListarActividadLeadOutput = ActividadLeadDTO[];

/** @group Casos de Uso */
export class ListarActividadLeadUseCase
  implements
    CasoDeUso<ListarActividadLeadInput, Resultado<ListarActividadLeadOutput, ErrorDeDominio>>,
    IListarActividadLead
{
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(
    input: ListarActividadLeadInput,
  ): Promise<Resultado<ListarActividadLeadOutput, ErrorDeDominio>> {
    try {
      const rows = await this.ventasRepository.obtenerActividadPorLead(idLead(input.idLead));

      return resultadoExitoso(
        rows.map((r) => ({
          id: r.id,
          evento: r.evento,
          descripcion: r.descripcion,
          fecha: r.fecha,
        })),
      );
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
