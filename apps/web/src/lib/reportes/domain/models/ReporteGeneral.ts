export type AccionResumen = Readonly<{
	evento: string;
	total: number;
}>;

export type EstadisticasGlobales = Readonly<{
	acciones: ReadonlyArray<AccionResumen>;
	totalAcciones: number;
}>;

export type ReporteGeneral = Readonly<{
	fechaGeneracion: string;
	resumenAcciones: {
		acciones: ReadonlyArray<AccionResumen>;
		totalAcciones: number;
	};
	actividadReciente: ReadonlyArray<{
		idLead: string;
		evento: string;
		descripcion: string;
		fecha: string;
	}>;
}>;
