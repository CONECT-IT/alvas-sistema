import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ActividadLeadDTO } from "../../dto/LeadDTOs";

export type ListarActividadLeadQuery = Readonly<{
  idLead: string;
}>;

export interface IListarActividadLead {
  ejecutar(input: ListarActividadLeadQuery): Promise<Resultado<ActividadLeadDTO[], ErrorDeDominio>>;
}
