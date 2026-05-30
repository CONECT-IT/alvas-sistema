import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type PropiedadDto = {
	id: string;
	titulo: string;
	descripcion?: string;
	precio: number;
	origen: string;
	estado: string;
	idLeadOrigen?: string;
	idClientePropietario?: string;
	captadaPorAsesorId?: string;
	asesorResponsableId?: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/propiedades').then((r) => r.json<ApiResp<PropiedadDto[]>>());

	return {
		propiedades: res.success ? res.data : [],
	};
};
