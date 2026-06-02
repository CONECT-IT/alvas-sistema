import { leerApi } from '$lib/shared/server/leerApi';
import type { ServerLoad } from '@sveltejs/kit';

type CitaDto = {
	id: string;
	idLead: string;
	nombreLead?: string;
	idPropiedad?: string;
	nombrePropiedad?: string;
	idAsesor: string;
	nombreAsesor?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
	observacion?: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/ventas/citas').then((r) => leerApi<CitaDto[]>(r, []));

	return {
		citas: res.success ? res.data : []
	};
};
