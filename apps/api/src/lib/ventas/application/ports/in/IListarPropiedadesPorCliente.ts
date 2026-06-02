import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";

export type ListarPropiedadesPorClienteQuery = Readonly<{
  idCliente: string;
}>;

/** @group Puertos de Entrada */
export interface IListarPropiedadesPorCliente {
  ejecutar(input: ListarPropiedadesPorClienteQuery): Promise<Resultado<string[], ErrorDeDominio>>;
}
