import { eq } from "drizzle-orm";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { obtenerDb } from "../../../shared/infrastructure/persistence/drizzle";
import { type CaptacionPendiente, type ICaptacionPendienteRepository } from "../../domain";
import { CaptacionPendienteMapper } from "./CaptacionPendienteMapper";
import { captacionesPendientesTable, type CaptacionPendienteRow } from "./schema";

/** @group Persistencia */
export class D1CaptacionPendienteRepository implements ICaptacionPendienteRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  private drizzle() {
    return obtenerDb(this.db);
  }

  async guardar(captacion: CaptacionPendiente): Promise<void> {
    const values = CaptacionPendienteMapper.aPersistencia(captacion);
    await this.drizzle().insert(captacionesPendientesTable).values(values).onConflictDoUpdate({
      target: captacionesPendientesTable.id,
      set: values,
    });
  }

  async obtenerPorId(id: string): Promise<CaptacionPendiente | null> {
    const [row] = await this.drizzle()
      .select()
      .from(captacionesPendientesTable)
      .where(eq(captacionesPendientesTable.id, id));

    return row ? CaptacionPendienteMapper.aDominio(row as CaptacionPendienteRow) : null;
  }

  async listarPendientes(): Promise<CaptacionPendiente[]> {
    const rows = await this.drizzle()
      .select()
      .from(captacionesPendientesTable)
      .where(eq(captacionesPendientesTable.estado, "PENDIENTE"));

    return rows.map((row) => CaptacionPendienteMapper.aDominio(row as CaptacionPendienteRow));
  }
}
