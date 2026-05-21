import { json, type Cookies } from '@sveltejs/kit';
import { getSession } from '$lib/auth/server/session';
import { getApiBaseUrl } from './api';

type ServerFetch = typeof globalThis.fetch;

export async function proxyApiGet(
	cookies: Cookies,
	fetch: ServerFetch,
	path: string
): Promise<Response> {
	const session = getSession(cookies);

	if (!session) {
		return json({ success: false, message: 'Sesión no iniciada.' }, { status: 401 });
	}

	const response = await fetch(`${getApiBaseUrl()}${path}`, {
		headers: {
			Authorization: `Bearer ${session.authToken}`
		}
	});
	const payload = await response.json();

	return json(payload, { status: response.status });
}
