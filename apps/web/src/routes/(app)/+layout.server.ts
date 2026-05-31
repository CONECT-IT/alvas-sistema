import { redirect } from '@sveltejs/kit';
import { getSession } from '$lib/auth/server/session';
import { refreshSession } from '$lib/auth/server/refreshSession';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ cookies, fetch, url }) => {
	const session =
		getSession(cookies) ?? (await refreshSession(cookies, fetch, url.protocol === 'https:'));

	if (!session) {
		const redirectTo = `${url.pathname}${url.search}`;
		redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	if (url.pathname.startsWith('/admin') && session.user.rol !== 'ADMIN') {
		redirect(303, '/asesor/dashboard');
	}

	if (url.pathname.startsWith('/asesor') && session.user.rol !== 'ASESOR') {
		redirect(303, '/admin/dashboard');
	}

	return {
		user: session.user
	};
};
