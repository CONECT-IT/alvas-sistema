import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

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
	const res = await fetch('/api/captaciones/pendientes').then((r) => r.json<ApiResp<CaptacionPendiente[]>>());

	return {
		captaciones: res.success ? res.data : [],
	};
};
