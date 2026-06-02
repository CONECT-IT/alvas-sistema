import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

type AccionResumen = {
	evento: string;
	total: number;
};

type ResumenAcciones = {
	acciones: AccionResumen[];
	totalAcciones: number;
};

type EstadisticasGlobales = ResumenAcciones;

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
	resumenAcciones: ResumenAcciones;
	actividadReciente: ActividadDto[];
};

export const load: ServerLoad = async ({ fetch }) => {
	const [estadisticasRes, propiedadesRes, reporteRes] = await Promise.all([
		fetch('/api/reportes/estadisticas-globales').then((r) =>
			leerApi<EstadisticasGlobales>(r, null)
		),
		fetch('/api/propiedades').then((r) => leerApi<PropiedadDto[]>(r, [])),
		fetch('/api/reportes/general').then((r) => leerApi<ReporteGeneral>(r, null))
	]);

	return {
		estadisticas: estadisticasRes.success ? estadisticasRes.data : null,
		propiedades: propiedadesRes.success ? propiedadesRes.data : [],
		reporte: reporteRes.success ? reporteRes.data : null
	};
};
