import { redirect } from '@sveltejs/kit';
import { getSession } from '$lib/auth/server/session';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = ({ cookies, url }) => {
	const session = getSession(cookies);

	if (!session) {
		redirect(303, '/login');
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
