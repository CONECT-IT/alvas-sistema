import { type ResumenAcciones } from "./ResumenAcciones";

export type ActividadReporte = Readonly<{
  idLead: string;
  evento: string;
  descripcion: string;
  fecha: string;
}>;

/** @group Entidades */
export class ReporteGeneral {
  constructor(
    readonly fechaGeneracion: Date,
    readonly resumenAcciones: ResumenAcciones,
    readonly actividadReciente: ReadonlyArray<ActividadReporte>,
  ) {}
}
