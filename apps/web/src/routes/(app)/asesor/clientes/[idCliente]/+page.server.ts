import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

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
		fetch(`/api/ventas/cliente/${params.idCliente}`).then((r) => leerApi<ClienteDto>(r, null)),
		fetch(`/api/ventas/cliente/${params.idCliente}/propiedades`).then((r) =>
			leerApi<unknown[]>(r, [])
		)
	]);

	return {
		cliente: clienteRes.success ? clienteRes.data : null,
		propiedades: propiedadesRes.success ? propiedadesRes.data : []
	};
};
