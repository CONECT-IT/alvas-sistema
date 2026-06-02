import { leerApi } from '$lib/shared/server/leerApi';
import type { ServerLoad } from '@sveltejs/kit';

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
	const res = await fetch('/api/ventas/clientes').then((r) => leerApi<ClienteDto[]>(r, []));

	return {
		clientes: res.success ? res.data : []
	};
};
