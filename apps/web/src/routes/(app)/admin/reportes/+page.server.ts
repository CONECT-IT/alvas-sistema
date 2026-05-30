import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type ActividadDto = {
	idLead: string;
	evento: string;
	descripcion: string;
	fecha: string;
};

type ReporteGeneral = {
	fechaGeneracion: string;
	metricas: {
		conversionRate: number;
		leadsNuevosHoy: number;
		citasPendientes: number;
	};
	actividadReciente: ActividadDto[];
};

type EstadisticasGlobales = {
	totalLeads: number;
	totalClientes: number;
	leadsPorEstado: Record<string, number>;
	asesoresActivos: number;
};

export const load: ServerLoad = async ({ fetch }) => {
	const [reporteRes, estadisticasRes] = await Promise.all([
		fetch('/api/reportes/general').then((r) => r.json<ApiResp<ReporteGeneral>>()),
		fetch('/api/reportes/estadisticas-globales').then((r) =>
			r.json<ApiResp<EstadisticasGlobales>>()
		)
	]);

	return {
		reporte: reporteRes.success ? reporteRes.data : null,
		estadisticas: estadisticasRes.success ? estadisticasRes.data : null
	};
};
