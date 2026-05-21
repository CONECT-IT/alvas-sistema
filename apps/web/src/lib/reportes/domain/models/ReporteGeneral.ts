export type EstadisticasGlobales = Readonly<{
	totalLeads: number;
	totalClientes: number;
	leadsPorEstado: Readonly<Record<string, number>>;
	asesoresActivos: number;
}>;

export type ReporteGeneral = Readonly<{
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
