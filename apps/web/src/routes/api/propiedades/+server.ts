import { proxyApiGet, proxyApiPost } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	return proxyApiGet(cookies, fetch, '/propiedades');
};

export const POST: RequestHandler = async ({ cookies, fetch, request }) => {
	const body = (await request.json()) as Record<string, unknown>;

	return proxyApiPost(cookies, fetch, '/propiedades', body);
};
