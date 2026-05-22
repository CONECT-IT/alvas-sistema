import { proxyApiGet } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, fetch, url }) => {
	const id = url.pathname.split('/').at(-2);
	return proxyApiGet(cookies, fetch, `/ventas/cliente/${id}/propiedades`);
};
