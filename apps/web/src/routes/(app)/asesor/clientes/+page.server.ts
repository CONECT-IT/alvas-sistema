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

export const load: ServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/ventas/clientes').then((r) => r.json<ApiResp<ClienteDto[]>>());

	return {
		clientes: res.success ? res.data : []
	};
};
