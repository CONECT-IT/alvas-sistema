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

type UsuarioDto = {
	id: string;
	username: string;
	nombre: string;
	rol: string;
	estado: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const [propiedadesRes, usuariosRes] = await Promise.all([
		fetch('/api/propiedades').then((r) => leerApi<PropiedadDto[]>(r, [])),
		fetch('/api/usuarios').then((r) => leerApi<UsuarioDto[]>(r, []))
	]);

	return {
		propiedades: propiedadesRes.success ? propiedadesRes.data : [],
		asesores: usuariosRes.success
			? usuariosRes.data.filter((u) => u.rol === 'ASESOR' && u.estado === 'ACTIVO')
			: []
	};
};
