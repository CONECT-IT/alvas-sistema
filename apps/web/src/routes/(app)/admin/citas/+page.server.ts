import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

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
	const res = await fetch('/api/ventas/citas').then((r) => r.json<ApiResp<CitaDto[]>>());

	return {
		citas: res.success ? res.data : []
	};
};
