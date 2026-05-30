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

export const load: ServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/propiedades/${params.idPropiedad}`).then((r) =>
		r.json<ApiResp<PropiedadDto>>()
	);

	return {
		propiedad: res.success ? res.data : null,
		idPropiedad: params.idPropiedad
	};
};
