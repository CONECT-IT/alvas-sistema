export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type EstadisticasGlobalesDTO = Readonly<{
	totalLeads: number;
	totalClientes: number;
	leadsPorEstado: Readonly<Record<string, number>>;
	asesoresActivos: number;
}>;

export type ReporteGeneralDTO = Readonly<{
	fechaGeneracion: string;
	metricas: {
		conversionRate: number;
		leadsNuevosHoy: number;
		citasPendientes: number;
	};
	actividadReciente: ReadonlyArray<{
		idLead: string;
		evento: string;
		descripcion: string;
		fecha: string;
	}>;
}>;
