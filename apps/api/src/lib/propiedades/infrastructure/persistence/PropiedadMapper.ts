import { Propiedad } from "../../domain/entities";
import { EstadoPropiedad } from "../../domain/value-objects/EstadoPropiedad";
import { idPropiedad, idUsuarioRef } from "../../domain/value-objects";
import { type OrigenPropiedad } from "../../domain/entities/Propiedad";
import { type PropiedadRow } from "./schema";

/**
 * Mapa entre la entidad de dominio Propiedad y su representacion en persistencia.
 *
 * @group Persistencia
 */
export class PropiedadMapper {
  static aDominio(row: PropiedadRow): Propiedad {
    return Propiedad.reconstituir({
      id: idPropiedad(row.id),
      titulo: row.titulo,
      descripcion: row.descripcion,
      precio: row.precio,
      origen: row.origen as OrigenPropiedad,
      estado: EstadoPropiedad.desde(row.estado),
      idLeadOrigen: row.idLeadOrigen ?? undefined,
      idClientePropietario: row.idClientePropietario ?? undefined,
      captadaPorAsesorId: row.captadaPorAsesorId ? idUsuarioRef(row.captadaPorAsesorId) : undefined,
      asesorResponsableId: row.asesorResponsableId
        ? idUsuarioRef(row.asesorResponsableId)
        : undefined,
      creadoEn: new Date(row.creadoEn),
      actualizadoEn: new Date(row.actualizadoEn),
    });
  }

  static aPersistencia(propiedad: Propiedad) {
    return {
      id: propiedad.id as string,
      titulo: propiedad.titulo,
      descripcion: propiedad.descripcion,
      precio: propiedad.precio,
      origen: propiedad.origen,
      estado: propiedad.estado.valor,
      idLeadOrigen: propiedad.idLeadOrigen,
      idClientePropietario: propiedad.idClientePropietario,
      captadaPorAsesorId: propiedad.captadaPorAsesorId as string | undefined,
      asesorResponsableId: propiedad.asesorResponsableId as string | undefined,
      creadoEn: propiedad.creadoEn.toISOString(),
      actualizadoEn: propiedad.actualizadoEn.toISOString(),
    };
  }
}
