import { proxyApiPost } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, fetch, params, request }) => {
	const body = (await request.json()) as Record<string, unknown>;

	return proxyApiPost(
		cookies,
		fetch,
		`/integraciones/captaciones/pendientes/${params.idCaptacion}/rechazar`,
		body
	);
};
