import { proxyPublicApiPost } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ fetch, request }) => {
	const body = (await request.json()) as Record<string, unknown>;

	return proxyPublicApiPost(fetch, '/integraciones/captaciones', body);
};
