import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

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
		fetch(`/api/ventas/lead/${params.idLead}`).then((r) => leerApi<LeadDetalle>(r, null)),
		fetch(`/api/ventas/lead/${params.idLead}/actividad`).then((r) => leerApi<unknown[]>(r, []))
	]);

	return {
		lead: leadRes.success ? leadRes.data : null,
		actividad: actividadRes.success ? actividadRes.data : []
	};
};
