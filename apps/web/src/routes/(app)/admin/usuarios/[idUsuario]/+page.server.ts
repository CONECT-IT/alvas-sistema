import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type UsuarioDto = {
	id: string;
	username: string;
	nombre: string;
	rol: string;
	estado: string;
};

export const load: ServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/usuarios/${params.idUsuario}`).then((r) => r.json<ApiResp<UsuarioDto>>());

	return {
		usuario: res.success ? res.data : null,
	};
};
