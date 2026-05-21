import { json, type RequestHandler } from '@sveltejs/kit';
import { clearSessionCookies } from '$lib/auth/server/session';

export const POST: RequestHandler = ({ cookies }) => {
	clearSessionCookies(cookies);
	return json({ success: true });
};
