import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type ClienteDto = {
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	idAsesor: string;
	creadoEn: string;
	actualizadoEn: string;
};

export const load: ServerLoad = async ({ fetch, params }) => {
	const [clienteRes, propiedadesRes] = await Promise.all([
		fetch(`/api/ventas/cliente/${params.idCliente}`).then((r) => r.json<ApiResp<ClienteDto>>()),
		fetch(`/api/ventas/cliente/${params.idCliente}/propiedades`).then((r) => r.json<ApiResp<unknown[]>>()),
	]);

	return {
		cliente: clienteRes.success ? clienteRes.data : null,
		propiedades: propiedadesRes.success ? propiedadesRes.data : [],
	};
};
