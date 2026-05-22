import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type EstadisticasGlobales = {
	totalLeads: number;
	totalClientes: number;
	asesoresActivos: number;
};

type PropiedadDto = {
	id: string;
	titulo: string;
	descripcion: string;
	precio: number;
	estado: string;
	origen: string;
};

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

export const load: ServerLoad = async ({ fetch }) => {
	const [estadisticasRes, propiedadesRes, reporteRes] = await Promise.all([
		fetch('/api/reportes/estadisticas-globales').then((r) =>
			r.json<ApiResp<EstadisticasGlobales>>()
		),
		fetch('/api/propiedades').then((r) => r.json<ApiResp<PropiedadDto[]>>()),
		fetch('/api/reportes/general').then((r) => r.json<ApiResp<ReporteGeneral>>())
	]);

	return {
		estadisticas: estadisticasRes.success ? estadisticasRes.data : null,
		propiedades: propiedadesRes.success ? propiedadesRes.data : [],
		reporte: reporteRes.success ? reporteRes.data : null
	};
};
