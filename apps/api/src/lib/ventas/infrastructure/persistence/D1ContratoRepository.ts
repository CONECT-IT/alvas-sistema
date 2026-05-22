import { eq, inArray } from "drizzle-orm";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { obtenerDb } from "../../../shared/infrastructure/persistence/drizzle";
import { Contrato } from "../../domain/entities/Contrato";
import { type IContratoRepository } from "../../domain/ports/IContratoRepository";
import { type IdCliente, type IdContrato, type IdLead } from "../../domain/value-objects/Ids";
import { contratosTable, type ContratoRow } from "./schema";
import { VentasMapper } from "./VentasMapper";

export class D1ContratoRepository implements IContratoRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  private drizzle() {
    return obtenerDb(this.db);
  }

  async buscarPorId(id: IdContrato): Promise<Contrato | null> {
    const row = await this.drizzle()
      .select()
      .from(contratosTable)
      .where(eq(contratosTable.id, id as string))
      .get();

    return row ? VentasMapper.contratoADominio(row as ContratoRow) : null;
  }

  async guardar(contrato: Contrato): Promise<void> {
    const values = VentasMapper.contratoAPersistencia(contrato);

    await this.drizzle().insert(contratosTable).values(values).onConflictDoUpdate({
      target: contratosTable.id,
      set: values,
    });
  }

  async listar(): Promise<Contrato[]> {
    const rows = await this.drizzle().select().from(contratosTable).all();
    return rows.map((row) => VentasMapper.contratoADominio(row as ContratoRow));
  }

  async listarPorCliente(idCliente: IdCliente): Promise<Contrato[]> {
    const rows = await this.drizzle()
      .select()
      .from(contratosTable)
      .where(eq(contratosTable.idCliente, idCliente as string))
      .all();

    return rows.map((row) => VentasMapper.contratoADominio(row as ContratoRow));
  }

  async listarPorLead(idLead: IdLead): Promise<Contrato[]> {
    const rows = await this.drizzle()
      .select()
      .from(contratosTable)
      .where(eq(contratosTable.idLead, idLead as string))
      .all();

    return rows.map((row) => VentasMapper.contratoADominio(row as ContratoRow));
  }

  async listarPorIdsLead(ids: IdLead[]): Promise<Contrato[]> {
    if (ids.length === 0) return [];
    const idsStr = ids.map((id) => id as string);

    const rows = await this.drizzle()
      .select()
      .from(contratosTable)
      .where(inArray(contratosTable.idLead, idsStr))
      .all();

    return rows.map((row) => VentasMapper.contratoADominio(row as ContratoRow));
  }
}
