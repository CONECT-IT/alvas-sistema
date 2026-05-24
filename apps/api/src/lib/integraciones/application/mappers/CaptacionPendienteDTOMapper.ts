import { type CaptacionPendiente } from "../../domain";
import { type CaptacionPendienteDTO } from "../dto/CaptacionDTOs";

export function captacionPendienteADTO(captacion: CaptacionPendiente): CaptacionPendienteDTO {
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
    metadata: captacion.captacion.metadata,
    razonDuplicado: captacion.razonDuplicado,
    creadoEn: captacion.creadoEn.toISOString(),
    actualizadoEn: captacion.actualizadoEn.toISOString(),
  };
}
