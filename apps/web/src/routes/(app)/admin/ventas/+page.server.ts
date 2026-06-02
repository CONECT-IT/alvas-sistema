import { leerApi } from '$lib/shared/server/leerApi';
import type { ServerLoad } from '@sveltejs/kit';

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

export const load: ServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/ventas/pipeline').then((r) => leerApi<LeadPipeline[]>(r, []));

	return {
		leads: res.success ? res.data : []
	};
};
