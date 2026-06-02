import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ActividadLeadDTO } from "../../dto/LeadDTOs";

export type ListarActividadLeadQuery = Readonly<{
  idLead: string;
}>;

/** @group Puertos de Entrada */
export interface IListarActividadLead {
  ejecutar(input: ListarActividadLeadQuery): Promise<Resultado<ActividadLeadDTO[], ErrorDeDominio>>;
}
