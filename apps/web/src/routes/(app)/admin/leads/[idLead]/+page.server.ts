import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type CitaDto = {
	id: string;
	idLead: string;
	idPropiedad?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
	observacion?: string;
};

type LeadDetalle = {
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	tipo: string;
	estado: string;
	idAsesor: string;
	idPropiedadInteres?: string;
	citas: CitaDto[];
	creadoEn: string;
	actualizadoEn: string;
};

export const load: ServerLoad = async ({ fetch, params }) => {
	const [leadRes, actividadRes] = await Promise.all([
		fetch(`/api/ventas/lead/${params.idLead}`).then((r) => r.json<ApiResp<LeadDetalle>>()),
		fetch(`/api/ventas/lead/${params.idLead}/actividad`).then((r) => r.json<ApiResp<unknown[]>>())
	]);

	return {
		lead: leadRes.success ? leadRes.data : null,
		actividad: actividadRes.success ? actividadRes.data : []
	};
};
