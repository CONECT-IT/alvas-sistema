import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Cliente } from "../../../domain/entities/Cliente";

/** @group Puertos de Entrada */
export interface IListarClientes {
  ejecutar(): Promise<Resultado<Cliente[], ErrorDeDominio>>;
}
