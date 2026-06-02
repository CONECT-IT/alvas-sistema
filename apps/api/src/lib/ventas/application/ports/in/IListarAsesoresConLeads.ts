import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";

export type AsesorConLeadsDTO = Readonly<{
  idAsesor: string;
  totalLeads: number;
}>;

/** @group Puertos de Entrada */
export interface IListarAsesoresConLeads {
  ejecutar(): Promise<Resultado<AsesorConLeadsDTO[], ErrorDeDominio>>;
}
