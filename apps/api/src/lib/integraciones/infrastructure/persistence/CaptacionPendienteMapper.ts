import { CaptacionPendiente, Captacion } from "../../domain/entities";
import { EstadoCaptacion } from "../../domain/value-objects";
import { type CaptacionPendienteRow, type NuevaCaptacionPendienteRow } from "./schema";

function parsearMetadata(
  metadataJson: string | null,
): Readonly<Record<string, string>> | undefined {
  if (!metadataJson) return undefined;
  const parsed = JSON.parse(metadataJson) as Record<string, string>;
  return parsed;
}

function normalizarCanalCaptacion(canal: string): string {
  if (canal === "FORMULARIO") return "FORMULARIO_WEB";
  return canal;
}

export class CaptacionPendienteMapper {
  static aDominio(row: CaptacionPendienteRow): CaptacionPendiente {
    return CaptacionPendiente.reconstituir({
      id: row.id,
      captacion: Captacion.registrar({
        canal: normalizarCanalCaptacion(row.canal),
        origen: row.origen,
        nombre: row.nombre,
        telefono: row.telefono,
        email: row.email,
        tipo: row.tipo,
        idPropiedadInteres: row.idPropiedadInteres ?? undefined,
        metadata: parsearMetadata(row.metadataJson),
      }),
      estado: EstadoCaptacion.desde(row.estado),
      razonDuplicado: row.razonDuplicado ?? undefined,
      creadoEn: new Date(row.creadoEn),
      actualizadoEn: new Date(row.actualizadoEn),
    });
  }

  static aPersistencia(captacion: CaptacionPendiente): NuevaCaptacionPendienteRow {
    return {
      id: captacion.id,
      canal: captacion.captacion.canal.valor,
      origen: captacion.captacion.origen.valor,
      nombre: captacion.captacion.contacto.nombre,
      telefono: captacion.captacion.contacto.telefono,
      email: captacion.captacion.emailDeContacto,
      tipo: captacion.captacion.tipo,
      estado: captacion.estado.valor,
      idPropiedadInteres: captacion.captacion.idPropiedadInteres,
      metadataJson: captacion.captacion.metadata
        ? JSON.stringify(captacion.captacion.metadata)
        : undefined,
      razonDuplicado: captacion.razonDuplicado,
      creadoEn: captacion.creadoEn.toISOString(),
      actualizadoEn: captacion.actualizadoEn.toISOString(),
    };
  }
}
