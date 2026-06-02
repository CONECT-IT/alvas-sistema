import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Cliente } from "../../../domain/entities/Cliente";
import { type ConvertirLeadAClienteInput } from "../../use-cases/ConvertirLeadAClienteUseCase";

/** @group Puertos de Entrada */
export interface IConvertirLeadACliente {
  ejecutar(input: ConvertirLeadAClienteInput): Promise<Resultado<Cliente, ErrorDeDominio>>;
}
