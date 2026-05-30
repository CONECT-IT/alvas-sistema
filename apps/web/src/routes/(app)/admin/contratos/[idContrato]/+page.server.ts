import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type ContratoDto = {
	id: string;
	idLead?: string;
	nombreLead?: string;
	idCliente?: string;
	idPropiedad: string;
	nombrePropiedad?: string;
	idAsesor?: string;
	nombreAsesor?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
	creadoEn: string;
	actualizadoEn: string;
};

export const load: ServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/ventas/contratos/${params.idContrato}`).then((r) => r.json<ApiResp<ContratoDto>>());

	return {
		contrato: res.success ? res.data : null,
	};
};
