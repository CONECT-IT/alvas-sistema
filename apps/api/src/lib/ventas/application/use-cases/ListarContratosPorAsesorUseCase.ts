import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IContratoRepository } from "../../domain/ports/IContratoRepository";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { ErrorDeDominio } from "../../../shared/domain";
import { type ListarContratosOutputDTO } from "../dto/ContratoDTOs";
import { type IListarContratosPorAsesor } from "../ports/in";

export type ListarContratosPorAsesorInput = {
  idAsesor: string;
};

export class ListarContratosPorAsesorUseCase
  implements
    CasoDeUso<ListarContratosPorAsesorInput, Resultado<ListarContratosOutputDTO, ErrorDeDominio>>,
    IListarContratosPorAsesor
{
  constructor(
    private readonly contratoRepository: IContratoRepository,
    private readonly ventasRepository: IVentasRepository,
  ) {}

  async ejecutar(
    input: ListarContratosPorAsesorInput,
  ): Promise<Resultado<ListarContratosOutputDTO, ErrorDeDominio>> {
    try {
      const leads = await this.ventasRepository.listarLeadsPorAsesor(idUsuarioRef(input.idAsesor));
      const idsLead = leads.map((lead) => lead.id);
      const contratos = await this.contratoRepository.listarPorIdsLead(idsLead);

      const output: ListarContratosOutputDTO = {
        contratos: contratos.map((contrato) => ({
          id: contrato.id as string,
          idLead: contrato.idLead as string | undefined,
          idCliente: contrato.idCliente as string | undefined,
          idPropiedad: contrato.idPropiedad,
          idAsesor: input.idAsesor,
          fechaInicio: contrato.fechaInicio.toISOString(),
          fechaFin: contrato.fechaFin.toISOString(),
          estado: contrato.estado,
          creadoEn: contrato.creadoEn.toISOString(),
          actualizadoEn: contrato.actualizadoEn.toISOString(),
        })),
      };

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
