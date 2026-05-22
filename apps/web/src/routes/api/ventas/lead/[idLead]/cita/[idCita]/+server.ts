import { proxyApiPut } from '$lib/shared/server/proxyApi';
import type { RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ cookies, fetch, request, url }) => {
	const body = (await request.json()) as Record<string, unknown>;
	const parts = url.pathname.split('/');
	const idLead = parts.at(-3);
	const idCita = parts.at(-1);

	return proxyApiPut(cookies, fetch, `/ventas/lead/${idLead}/cita/${idCita}`, body);
};
