import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Esquema D1 para captaciones pendientes de integraciones. */
export const captacionesPendientesTable = sqliteTable("integraciones_captaciones_pendientes", {
  id: text("id").primaryKey(),
  canal: text("canal").notNull(),
  origen: text("origen").notNull(),
  nombre: text("nombre").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email").notNull(),
  tipo: text("tipo").notNull(),
  estado: text("estado").notNull().default("PENDIENTE"),
  idPropiedadInteres: text("id_propiedad_interes"),
  metadataJson: text("metadata_json"),
  razonDuplicado: text("razon_duplicado"),
  creadoEn: text("creado_en").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export type CaptacionPendienteRow = typeof captacionesPendientesTable.$inferSelect;
export type NuevaCaptacionPendienteRow = typeof captacionesPendientesTable.$inferInsert;
