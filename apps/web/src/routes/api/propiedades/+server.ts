import { json, type RequestHandler } from '@sveltejs/kit';
import { getSession } from '$lib/auth/server/session';
import { getApiBaseUrl } from '$lib/shared/server/api';

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	const session = getSession(cookies);

	if (!session) {
		return json({ success: false, message: 'Sesión no iniciada.' }, { status: 401 });
	}

	const response = await fetch(`${getApiBaseUrl()}/propiedades`, {
		headers: {
			Authorization: `Bearer ${session.authToken}`
		}
	});
	const payload = await response.json();

	return json(payload, { status: response.status });
};
