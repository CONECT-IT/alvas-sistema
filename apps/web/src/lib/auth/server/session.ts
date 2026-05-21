import type { Cookies } from '@sveltejs/kit';
import type { UserRol } from '../domain/models/User';

export type SessionUser = Readonly<{
	id: string;
	username: string;
	nombre: string;
	rol: UserRol;
	estado: string;
}>;

export type SessionData = Readonly<{
	authToken: string;
	refreshToken: string;
	user: SessionUser;
}>;

const AUTH_COOKIE = 'alvas_auth_token';
const REFRESH_COOKIE = 'alvas_refresh_token';
const USER_COOKIE = 'alvas_session_user';

const AUTH_MAX_AGE_SECONDS = 60 * 15;
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function encodeCookieJson(value: unknown): string {
	return encodeURIComponent(JSON.stringify(value));
}

function decodeCookieJson<T>(value: string | undefined): T | null {
	if (!value) return null;

	try {
		return JSON.parse(decodeURIComponent(value)) as T;
	} catch {
		return null;
	}
}

function normalizeRole(value: unknown): UserRol | null {
	const role = String(value ?? '')
		.trim()
		.toUpperCase();

	if (role === 'ADMIN' || role === 'ASESOR') {
		return role;
	}

	return null;
}

export function toSessionUser(value: {
	id: string;
	username: string;
	nombre?: string;
	rol: unknown;
	estado?: string;
}): SessionUser | null {
	const role = normalizeRole(value.rol);

	if (!role) {
		return null;
	}

	return {
		id: value.id,
		username: value.username,
		nombre: value.nombre ?? value.username,
		rol: role,
		estado: value.estado ?? 'ACTIVO'
	};
}

export function setSessionCookies(cookies: Cookies, session: SessionData, secure: boolean): void {
	const baseOptions = {
		path: '/',
		httpOnly: true,
		secure,
		sameSite: 'lax' as const
	};

	cookies.set(AUTH_COOKIE, session.authToken, {
		...baseOptions,
		maxAge: AUTH_MAX_AGE_SECONDS
	});
	cookies.set(REFRESH_COOKIE, session.refreshToken, {
		...baseOptions,
		maxAge: REFRESH_MAX_AGE_SECONDS
	});
	cookies.set(USER_COOKIE, encodeCookieJson(session.user), {
		...baseOptions,
		maxAge: REFRESH_MAX_AGE_SECONDS
	});
}

export function getSession(cookies: Cookies): SessionData | null {
	const authToken = cookies.get(AUTH_COOKIE);
	const refreshToken = cookies.get(REFRESH_COOKIE);
	const userCookie = decodeCookieJson<SessionUser>(cookies.get(USER_COOKIE));

	if (!authToken || !refreshToken || !userCookie) {
		return null;
	}

	const user = toSessionUser(userCookie);

	if (!user) {
		return null;
	}

	return {
		authToken,
		refreshToken,
		user
	};
}

export function clearSessionCookies(cookies: Cookies): void {
	for (const name of [AUTH_COOKIE, REFRESH_COOKIE, USER_COOKIE]) {
		cookies.delete(name, { path: '/' });
	}
}
