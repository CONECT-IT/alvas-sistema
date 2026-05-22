import { proxyApiGet } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, fetch, url }) => {
	const idLead = url.pathname.split('/').at(-2);
	return proxyApiGet(cookies, fetch, `/ventas/lead/${idLead}/actividad`);
};
