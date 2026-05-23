import { proxyApiGet, proxyApiPut } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, fetch, url }) => {
	const idUsuario = url.pathname.split('/').at(-1);

	return proxyApiGet(cookies, fetch, `/usuarios/${idUsuario}`);
};

export const PUT: RequestHandler = async ({ cookies, fetch, request, url }) => {
	const body = (await request.json()) as Record<string, unknown>;
	const idUsuario = url.pathname.split('/').at(-1);

	return proxyApiPut(cookies, fetch, `/usuarios/${idUsuario}`, body);
};
