import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

type LeadCita = {
	id: string;
	idLead: string;
	idPropiedad?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
};

type LeadPipeline = {
	id: string;
	nombre: string;
	estado: string;
	tipo: string;
	idAsesor?: string;
	nombreAsesor?: string;
	citasCount: number;
	citas: LeadCita[];
};

type PropiedadDto = {
	id: string;
	titulo: string;
	precio: number;
	estado: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const [pipelineRes, propiedadesRes] = await Promise.all([
		fetch('/api/ventas/pipeline').then((r) => leerApi<LeadPipeline[]>(r, [])),
		fetch('/api/propiedades').then((r) => leerApi<PropiedadDto[]>(r, []))
	]);

	return {
		leads: pipelineRes.success ? pipelineRes.data : [],
		propiedadesDisponibles: propiedadesRes.success
			? propiedadesRes.data.filter((p) => p.estado.toUpperCase() === 'DISPONIBLE')
			: []
	};
};
