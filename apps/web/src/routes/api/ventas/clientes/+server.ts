import { proxyApiGet } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	return proxyApiGet(cookies, fetch, '/ventas/clientes');
};
