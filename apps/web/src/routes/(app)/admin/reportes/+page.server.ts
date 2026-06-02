import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

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
		fetch('/api/reportes/general').then((r) => leerApi<ReporteGeneral>(r, null)),
		fetch('/api/reportes/estadisticas-globales').then((r) => leerApi<EstadisticasGlobales>(r, null))
	]);

	return {
		reporte: reporteRes.success ? reporteRes.data : null,
		estadisticas: estadisticasRes.success ? estadisticasRes.data : null
	};
};
