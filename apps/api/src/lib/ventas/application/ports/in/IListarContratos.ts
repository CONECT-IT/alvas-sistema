import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ListarContratosOutputDTO } from "../../dto/ContratoDTOs";

/** @group Puertos de Entrada */
export interface IListarContratos {
  ejecutar(): Promise<Resultado<ListarContratosOutputDTO, ErrorDeDominio>>;
}
