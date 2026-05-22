import { json, type Cookies } from '@sveltejs/kit';
import { getSession } from '$lib/auth/server/session';
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
	const response = await fetch(`${getApiBaseUrl()}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const payload = await response.json();

	return json(payload, { status: response.status });
}

async function proxyApiRequest(
	cookies: Cookies,
	fetch: ServerFetch,
	path: string,
	method: 'GET' | 'POST' | 'PUT',
	body?: ProxyBody
): Promise<Response> {
	const session = getSession(cookies);

	if (!session) {
		return json({ success: false, message: 'Sesión no iniciada.' }, { status: 401 });
	}

	const response = await fetch(`${getApiBaseUrl()}${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${session.authToken}`,
			...(body ? { 'Content-Type': 'application/json' } : {})
		},
		body: body ? JSON.stringify(body) : undefined
	});
	const payload = await response.json();

	return json(payload, { status: response.status });
}
