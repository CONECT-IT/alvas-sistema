/** @group DTOs */
export type AccionResumenDTO = Readonly<{
  evento: string;
  total: number;
}>;

export type ResumenAccionesOutput = Readonly<{
  acciones: ReadonlyArray<AccionResumenDTO>;
  totalAcciones: number;
}>;

export type ReporteGeneralOutput = Readonly<{
  fechaGeneracion: Date;
  resumenAcciones: ResumenAccionesOutput;
  actividadReciente: ReadonlyArray<{
    idLead: string;
    evento: string;
    descripcion: string;
    fecha: string;
  }>;
}>;

export type EstadisticasGlobalesOutput = ResumenAccionesOutput;
