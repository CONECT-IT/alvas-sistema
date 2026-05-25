import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

process.env.PUBLIC_APP_ENV ??= 'local';
process.env.PUBLIC_APP_VERSION ??= 'dev';
process.env.PUBLIC_APP_COMMIT ??= '';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 5173
	}
});
