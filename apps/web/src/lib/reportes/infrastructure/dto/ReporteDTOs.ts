export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type AccionResumenDTO = Readonly<{
	evento: string;
	total: number;
}>;

export type EstadisticasGlobalesDTO = Readonly<{
	acciones: ReadonlyArray<AccionResumenDTO>;
	totalAcciones: number;
}>;

export type ReporteGeneralDTO = Readonly<{
	fechaGeneracion: string;
	resumenAcciones: {
		acciones: ReadonlyArray<AccionResumenDTO>;
		totalAcciones: number;
	};
	actividadReciente: ReadonlyArray<{
		idLead: string;
		evento: string;
		descripcion: string;
		fecha: string;
	}>;
}>;
