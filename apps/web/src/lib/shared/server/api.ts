import { env } from '$env/dynamic/private';

export function getApiBaseUrl(): string {
	return env.API_URL || env.VITE_API_URL || 'http://localhost:8787';
}
