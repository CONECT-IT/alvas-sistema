import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

type CaptacionPendiente = {
	id: string;
	canal: string;
	origen: string;
	nombre: string;
	telefono: string;
	email: string;
	tipo: string;
	estado: string;
	idPropiedadInteres?: string;
	creadoEn: string;
	actualizadoEn: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/captaciones/pendientes').then((r) =>
		leerApi<CaptacionPendiente[]>(r, [])
	);

	return {
		captaciones: res.success ? res.data : []
	};
};
