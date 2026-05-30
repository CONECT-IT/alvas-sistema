import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type UsuarioDto = {
	id: string;
	username: string;
	nombre: string;
	rol: string;
	estado: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/usuarios').then((r) => r.json<ApiResp<UsuarioDto[]>>());

	return {
		usuarios: res.success ? res.data : []
	};
};
