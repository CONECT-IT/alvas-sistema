import { Contrato } from "../entities/Contrato";

/** @group Puertos */
export interface IContratoRepository {
  buscarPorId(id: string): Promise<Contrato | null>;
  guardar(contrato: Contrato): Promise<void>;
  listar(): Promise<Contrato[]>;
  listarPorCliente(idCliente: string): Promise<Contrato[]>;
  listarPorLead(idLead: string): Promise<Contrato[]>;
  listarPorIdsLead(ids: string[]): Promise<Contrato[]>;
}
