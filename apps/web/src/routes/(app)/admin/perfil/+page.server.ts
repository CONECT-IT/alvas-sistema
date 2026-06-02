import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

type UsuarioDto = {
	id: string;
	username: string;
	nombre: string;
	rol: string;
	estado: string;
};

export const load: ServerLoad = async ({ fetch, locals }) => {
	const payload = locals.authPayload;
	if (!payload) return { usuario: null };

	const res = await fetch(`/api/usuarios/${payload.idUsuario}`).then((r) =>
		leerApi<UsuarioDto>(r, null)
	);

	return {
		usuario: res.success ? res.data : null
	};
};
