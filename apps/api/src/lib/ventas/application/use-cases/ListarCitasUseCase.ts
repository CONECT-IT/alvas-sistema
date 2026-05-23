import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IListarCitas } from "../ports/in";

export type ListarCitasInput = void;

export type CitaConAsesorDTO = {
  id: string;
  idLead: string;
  idPropiedad?: string;
  idAsesor: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: string;
  observacion?: string;
};

export type ListarCitasOutput = CitaConAsesorDTO[];

export class ListarCitasUseCase
  implements CasoDeUso<ListarCitasInput, Resultado<ListarCitasOutput, ErrorDeDominio>>, IListarCitas
{
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(): Promise<Resultado<ListarCitasOutput, ErrorDeDominio>> {
    try {
      const leads = await this.ventasRepository.listarLeads();
      const output: CitaConAsesorDTO[] = [];

      for (const lead of leads) {
        for (const cita of lead.citas) {
          output.push({
            id: cita.id as string,
            idLead: cita.idLead as string,
            idPropiedad: cita.idPropiedad,
            idAsesor: lead.idAsesor as string,
            fechaInicio: cita.fechaInicio,
            fechaFin: cita.fechaFin,
            estado: cita.estado.valor,
            observacion: cita.observacion,
          });
        }
      }

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}
