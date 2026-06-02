import { leerApi } from '$lib/shared/server/leerApi';
import type { ServerLoad } from '@sveltejs/kit';

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
	const res = await fetch('/api/propiedades').then((r) => leerApi<PropiedadDto[]>(r, []));

	return {
		propiedades: res.success ? res.data : []
	};
};
