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

type UsuarioDto = {
	id: string;
	username: string;
	nombre: string;
	rol: string;
	estado: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const [propiedadesRes, usuariosRes] = await Promise.all([
		fetch('/api/propiedades').then((r) => r.json<ApiResp<PropiedadDto[]>>()),
		fetch('/api/usuarios').then((r) => r.json<ApiResp<UsuarioDto[]>>()),
	]);

	return {
		propiedades: propiedadesRes.success ? propiedadesRes.data : [],
		asesores: usuariosRes.success
			? usuariosRes.data.filter((u) => u.rol === 'ASESOR' && u.estado === 'ACTIVO')
			: [],
	};
};
