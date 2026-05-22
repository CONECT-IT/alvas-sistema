import { proxyApiPut } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ cookies, fetch, request, url }) => {
	const body = (await request.json()) as Record<string, unknown>;
	const idUsuario = url.pathname.split('/').at(-1);

	return proxyApiPut(cookies, fetch, `/usuarios/${idUsuario}`, body);
};
