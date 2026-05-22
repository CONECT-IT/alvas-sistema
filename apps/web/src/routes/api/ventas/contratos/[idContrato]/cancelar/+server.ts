import { proxyApiPost } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, fetch, url }) => {
	const idContrato = url.pathname.split('/').at(-2);
	return proxyApiPost(cookies, fetch, `/ventas/contratos/${idContrato}/cancelar`, {});
};
