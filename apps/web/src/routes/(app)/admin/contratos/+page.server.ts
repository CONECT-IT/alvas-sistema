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

type ListarContratosResp = {
	contratos: ContratoDto[];
};

export const load: ServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/ventas/contratos').then((r) => r.json<ApiResp<ListarContratosResp>>());

	return {
		contratos: res.success ? res.data.contratos : [],
	};
};
