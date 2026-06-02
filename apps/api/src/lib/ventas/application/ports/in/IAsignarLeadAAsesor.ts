import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type AsignarLeadAAsesorInputDTO } from "../../dto/LeadDTOs";

/** @group Puertos de Entrada */
export interface IAsignarLeadAAsesor {
  ejecutar(input: AsignarLeadAAsesorInputDTO): Promise<Resultado<void, ErrorDeDominio>>;
}
