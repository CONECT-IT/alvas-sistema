import type { Resultado } from "../../../../shared/application/Resultado";
import type { ErrorDeDominio } from "../../../../shared/domain/errors/ErrorDeDominio";

export type LeadPipelineDTO = Readonly<{
  id: string;
  nombre: string;
  estado: string;
  tipo: string;
  idAsesor: string;
  nombreAsesor?: string;
  citasCount: number;
  citas: ReadonlyArray<{
    id: string;
    idLead: string;
    idPropiedad?: string;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
    observacion?: string;
  }>;
}>;

export type ListarPipelineInput = {
  idUsuarioEjecutor: string;
  rolEjecutor: string;
};

export type ListarPipelineOutput = LeadPipelineDTO[];

/** @group Puertos de Entrada */
export interface IListarPipeline {
  ejecutar(input: ListarPipelineInput): Promise<Resultado<ListarPipelineOutput, ErrorDeDominio>>;
}
