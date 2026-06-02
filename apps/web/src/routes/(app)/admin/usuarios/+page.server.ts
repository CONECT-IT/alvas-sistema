import { leerApi } from '$lib/shared/server/leerApi';
import type { ServerLoad } from '@sveltejs/kit';

type UsuarioDto = {
	id: string;
	username: string;
	nombre: string;
	rol: string;
	estado: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/usuarios').then((r) => leerApi<UsuarioDto[]>(r, []));

	return {
		usuarios: res.success ? res.data : []
	};
};
