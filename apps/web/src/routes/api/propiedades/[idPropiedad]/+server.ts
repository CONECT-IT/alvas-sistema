import { proxyApiPut } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ cookies, fetch, params, request }) => {
	const body = (await request.json()) as Record<string, unknown>;

	return proxyApiPut(cookies, fetch, `/propiedades/${params.idPropiedad}`, body);
};
