import { proxyApiGet, proxyApiPut } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, fetch, params }) => {
	return proxyApiGet(cookies, fetch, `/propiedades/${params.idPropiedad}`);
};

export const PUT: RequestHandler = async ({ cookies, fetch, params, request }) => {
	const body = (await request.json()) as Record<string, unknown>;

	return proxyApiPut(cookies, fetch, `/propiedades/${params.idPropiedad}`, body);
};
