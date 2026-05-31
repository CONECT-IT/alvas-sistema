import { json, type Cookies } from '@sveltejs/kit';
import { getSession } from '$lib/auth/server/session';
import { refreshSession } from '$lib/auth/server/refreshSession';
import { getApiBaseUrl } from './api';

type ServerFetch = typeof globalThis.fetch;
type ProxyBody = Record<string, unknown> | unknown[];

export async function proxyApiGet(
	cookies: Cookies,
	fetch: ServerFetch,
	path: string
): Promise<Response> {
	return proxyApiRequest(cookies, fetch, path, 'GET');
}

export async function proxyApiPost(
	cookies: Cookies,
	fetch: ServerFetch,
	path: string,
	body: ProxyBody
): Promise<Response> {
	return proxyApiRequest(cookies, fetch, path, 'POST', body);
}

export async function proxyApiPut(
	cookies: Cookies,
	fetch: ServerFetch,
	path: string,
	body: ProxyBody
): Promise<Response> {
	return proxyApiRequest(cookies, fetch, path, 'PUT', body);
}

export async function proxyPublicApiPost(
	fetch: ServerFetch,
	path: string,
	body: ProxyBody
): Promise<Response> {
	let response: Response;
	try {
		response = await fetch(`${getApiBaseUrl()}${path}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
	} catch {
		console.warn('proxyApi: No se pudo conectar con el API');
		return json(
			{ success: false, message: 'No se pudo conectar con el API.', code: 'API_UNREACHABLE' },
			{ status: 502 }
		);
	}

	let payload: unknown;
	try {
		payload = await response.json();
	} catch {
		console.warn('proxyApi: Respuesta inválida del API');
		payload = {
			success: false,
			message: 'Respuesta inválida del API.',
			code: 'API_INVALID_RESPONSE'
		};
	}

	return json(payload, { status: response.status });
}

async function proxyApiRequest(
	cookies: Cookies,
	fetch: ServerFetch,
	path: string,
	method: 'GET' | 'POST' | 'PUT',
	body?: ProxyBody
): Promise<Response> {
	let session = getSession(cookies);

	if (!session) {
		session = await refreshSession(cookies, fetch, true);
	}

	if (!session) {
		return json({ success: false, message: 'Sesión no iniciada.' }, { status: 401 });
	}

	let response: Response;
	try {
		response = await enviarApi(fetch, path, method, session.authToken, body);
		if (response.status === 401) {
			const renovada = await refreshSession(cookies, fetch, true);
			if (renovada) {
				response = await enviarApi(fetch, path, method, renovada.authToken, body);
			}
		}
	} catch {
		console.warn(`proxyApi: No se pudo conectar con el API — ruta=${path}`);
		return json(
			{ success: false, message: 'No se pudo conectar con el API.', code: 'API_UNREACHABLE' },
			{ status: 502 }
		);
	}

	let payload: unknown;
	try {
		payload = await response.json();
	} catch {
		const text = await response.text().catch(() => '(no se pudo leer body)');
		console.warn(
			`proxyApi: Respuesta inválida del API — ruta=${path}, status=${response.status}, body="${text.slice(0, 300)}"`
		);
		payload = {
			success: false,
			message: 'Respuesta inválida del API.',
			code: 'API_INVALID_RESPONSE'
		};
	}

	return json(payload, { status: response.status });
}

function enviarApi(
	fetch: ServerFetch,
	path: string,
	method: 'GET' | 'POST' | 'PUT',
	authToken: string,
	body?: ProxyBody
): Promise<Response> {
	return fetch(`${getApiBaseUrl()}${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${authToken}`,
			...(body ? { 'Content-Type': 'application/json' } : {})
		},
		body: body ? JSON.stringify(body) : undefined
	});
}
