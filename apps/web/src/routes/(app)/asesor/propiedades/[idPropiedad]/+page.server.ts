import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

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
		leerApi<PropiedadDto>(r, null)
	);

	return {
		propiedad: res.success ? res.data : null,
		idPropiedad: params.idPropiedad
	};
};
