import type { Cookies } from '@sveltejs/kit';
import { getApiBaseUrl } from '$lib/shared/server/api';
import {
	clearSessionCookies,
	getRefreshSession,
	setSessionCookies,
	toSessionUser,
	type SessionData
} from './session';

type ServerFetch = typeof globalThis.fetch;

type RefreshApiResponse =
	| {
			success: true;
			data: {
				authToken: string;
				refreshToken: string;
				usuario: {
					id: string;
					username: string;
					rol: string;
				};
			};
	  }
	| {
			success: false;
			message?: string;
			code?: string;
	  };

export async function refreshSession(
	cookies: Cookies,
	fetch: ServerFetch,
	secure: boolean
): Promise<SessionData | null> {
	const refresh = getRefreshSession(cookies);

	if (!refresh) {
		return null;
	}

	try {
		const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken: refresh.refreshToken })
		});
		const payload = (await response.json()) as RefreshApiResponse;

		if (!response.ok || !payload.success) {
			clearSessionCookies(cookies);
			return null;
		}

		const user = toSessionUser({
			id: payload.data.usuario.id,
			username: payload.data.usuario.username,
			nombre: refresh.user.nombre,
			rol: payload.data.usuario.rol,
			estado: refresh.user.estado
		});

		if (!user) {
			clearSessionCookies(cookies);
			return null;
		}

		const session: SessionData = {
			authToken: payload.data.authToken,
			refreshToken: payload.data.refreshToken,
			user
		};

		setSessionCookies(cookies, session, secure);
		return session;
	} catch {
		console.warn('refreshSession: no se pudo renovar la sesión');
		return null;
	}
}
