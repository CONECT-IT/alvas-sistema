import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

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

	const res = await fetch(`/api/usuarios/${payload.idUsuario}`).then((r) => r.json<ApiResp<UsuarioDto>>());

	return {
		usuario: res.success ? res.data : null,
	};
};
