import { redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = () => {
	redirect(303, '/asesor/dashboard');
};
