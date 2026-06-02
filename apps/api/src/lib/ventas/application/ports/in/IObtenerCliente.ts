import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Cliente } from "../../../domain/entities/Cliente";

export type ObtenerClienteQuery = Readonly<{
  id: string;
}>;

/** @group Puertos de Entrada */
export interface IObtenerCliente {
  ejecutar(input: ObtenerClienteQuery): Promise<Resultado<Cliente, ErrorDeDominio>>;
}
