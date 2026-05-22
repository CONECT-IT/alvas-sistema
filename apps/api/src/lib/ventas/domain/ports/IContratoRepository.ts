import { Contrato } from "../entities/Contrato";
import { type IdContrato, type IdCliente, type IdLead } from "../value-objects/Ids";

export interface IContratoRepository {
  buscarPorId(id: IdContrato): Promise<Contrato | null>;
  guardar(contrato: Contrato): Promise<void>;
  listar(): Promise<Contrato[]>;
  listarPorCliente(idCliente: IdCliente): Promise<Contrato[]>;
  listarPorLead(idLead: IdLead): Promise<Contrato[]>;
  listarPorIdsLead(ids: IdLead[]): Promise<Contrato[]>;
}
