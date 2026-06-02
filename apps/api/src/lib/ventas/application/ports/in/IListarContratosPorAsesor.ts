import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ListarContratosOutputDTO } from "../../dto/ContratoDTOs";

/** @group Puertos de Entrada */
export interface IListarContratosPorAsesor {
  ejecutar(input: {
    idAsesor: string;
  }): Promise<Resultado<ListarContratosOutputDTO, ErrorDeDominio>>;
}
