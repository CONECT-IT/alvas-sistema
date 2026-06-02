import { eq } from "drizzle-orm";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { Propiedad } from "../../domain/entities";
import { type IPropiedadRepository } from "../../domain/ports";
import { obtenerDb } from "../../../shared/infrastructure/persistence/drizzle";
import { propiedadesTable, type PropiedadRow } from "./schema";
import { PropiedadMapper } from "./PropiedadMapper";

/**
 * Implementacion del repositorio de propiedades sobre D1 (Cloudflare).
 *
 * @group Persistencia
 */
export class D1PropiedadRepository implements IPropiedadRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  private drizzle() {
    return obtenerDb(this.db);
  }

  async obtenerPorId(id: string): Promise<Propiedad | null> {
    const row = await this.drizzle()
      .select()
      .from(propiedadesTable)
      .where(eq(propiedadesTable.id, id))
      .get();
    return row ? PropiedadMapper.aDominio(row as PropiedadRow) : null;
  }

  async existePorId(id: string): Promise<boolean> {
    const row = await this.drizzle()
      .select({ id: propiedadesTable.id })
      .from(propiedadesTable)
      .where(eq(propiedadesTable.id, id))
      .get();
    return !!row;
  }

  async eliminarPorId(id: string): Promise<void> {
    await this.drizzle().delete(propiedadesTable).where(eq(propiedadesTable.id, id));
  }

  async guardar(propiedad: Propiedad): Promise<void> {
    const values = PropiedadMapper.aPersistencia(propiedad);
    await this.drizzle().insert(propiedadesTable).values(values).onConflictDoUpdate({
      target: propiedadesTable.id,
      set: values,
    });
  }

  async listarTodas(): Promise<Propiedad[]> {
    const rows = await this.drizzle().select().from(propiedadesTable);
    return rows.map((row) => PropiedadMapper.aDominio(row as PropiedadRow));
  }
}
