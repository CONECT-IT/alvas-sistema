import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type IConsultaNombreAsesor } from "../../domain/ports/IConsultaNombreAsesor";
import { ErrorDeDominio } from "../../../shared/domain";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import {
  type IListarPipeline,
  type ListarPipelineInput,
  type ListarPipelineOutput,
} from "../ports/in/IListarPipeline";

/** @group Casos de Uso */
export class ListarPipelineUseCase
  implements
    CasoDeUso<ListarPipelineInput, Resultado<ListarPipelineOutput, ErrorDeDominio>>,
    IListarPipeline
{
  constructor(
    private readonly ventasRepository: IVentasRepository,
    private readonly consultaNombreAsesor: IConsultaNombreAsesor,
  ) {}

  async ejecutar(
    input: ListarPipelineInput,
  ): Promise<Resultado<ListarPipelineOutput, ErrorDeDominio>> {
    try {
      const leads =
        input.rolEjecutor === "ADMIN"
          ? await this.ventasRepository.listarLeads()
          : await this.ventasRepository.listarLeadsPorAsesor(idUsuarioRef(input.idUsuarioEjecutor));

      const data = await Promise.all(
        leads.map(async (lead) => {
          const nombreAsesor = await this.consultaNombreAsesor.obtenerNombre(
            lead.idAsesor as string,
          );

          return {
            id: lead.id as string,
            nombre: lead.nombre,
            estado: lead.estado.valor,
            tipo: lead.tipo.valor,
            idAsesor: lead.idAsesor as string,
            nombreAsesor,
            citasCount: lead.citas.length,
            citas: lead.citas.map((cita) => ({
              id: cita.id as string,
              idLead: cita.idLead as string,
              idPropiedad: cita.idPropiedad,
              fechaInicio: cita.fechaInicio.toISOString(),
              fechaFin: cita.fechaFin.toISOString(),
              estado: cita.estado.valor,
              observacion: cita.observacion,
            })),
          };
        }),
      );

      return resultadoExitoso(data);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
