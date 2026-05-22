import { proxyApiPost } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, fetch, params }) => {
	return proxyApiPost(cookies, fetch, `/ventas/contratos/${params.idContrato}/firmar`, {});
};
