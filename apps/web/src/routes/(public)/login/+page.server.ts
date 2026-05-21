import { fail, redirect } from '@sveltejs/kit';
import { getApiBaseUrl } from '$lib/shared/server/api';
import {
	getSession,
	setSessionCookies,
	toSessionUser,
	type SessionData
} from '$lib/auth/server/session';
import type { RequestEvent, ServerLoad } from '@sveltejs/kit';

type LoginApiResponse =
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

export const load: ServerLoad = ({ cookies }) => {
	const session = getSession(cookies);

	if (session?.user.rol === 'ADMIN') {
		redirect(303, '/admin/dashboard');
	}

	if (session?.user.rol === 'ASESOR') {
		redirect(303, '/asesor/dashboard');
	}
};

export const actions = {
	default: async ({ cookies, request, url, fetch }: RequestEvent) => {
		const formData = await request.formData();
		const username = String(formData.get('username') ?? '').trim();
		const clave = String(formData.get('clave') ?? '').trim();

		if (!username || !clave) {
			return fail(400, { message: 'Por favor, introduce el usuario y la contraseña.' });
		}

		const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, clave })
		});
		const payload = (await response.json()) as LoginApiResponse;

		if (!response.ok || !payload.success) {
			return fail(response.status || 401, {
				message: payload.success === false ? payload.message : 'Credenciales inválidas.'
			});
		}

		const user = toSessionUser({
			id: payload.data.usuario.id,
			username: payload.data.usuario.username,
			rol: payload.data.usuario.rol
		});

		if (!user) {
			return fail(500, {
				message: 'La API devolvió un rol de usuario no reconocido.'
			});
		}

		const session: SessionData = {
			authToken: payload.data.authToken,
			refreshToken: payload.data.refreshToken,
			user
		};

		setSessionCookies(cookies, session, url.protocol === 'https:');

		redirect(303, session.user.rol === 'ADMIN' ? '/admin/dashboard' : '/asesor/dashboard');
	}
};
