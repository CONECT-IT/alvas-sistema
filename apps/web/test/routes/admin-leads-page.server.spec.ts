import { describe, expect, it, vi } from 'vitest';

import { load } from '../../src/routes/(app)/admin/leads/+page.server';

const jsonResponse = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});

describe('admin / leads / load', () => {
	it('consulta captaciones mediante la ruta proxy correcta', async () => {
		const fetch = vi.fn((url: string | URL | Request) => {
			const path = String(url);

			if (path === '/api/ventas/pipeline') {
				return Promise.resolve(jsonResponse({ success: true, data: [] }));
			}

			if (path === '/api/propiedades') {
				return Promise.resolve(jsonResponse({ success: true, data: [] }));
			}

			if (path === '/api/usuarios') {
				return Promise.resolve(jsonResponse({ success: true, data: [] }));
			}

			if (path === '/api/captaciones/pendientes') {
				return Promise.resolve(jsonResponse({ success: true, data: [{ id: 'captacion-1' }] }));
			}

			if (path === '/api/ventas/clientes') {
				return Promise.resolve(jsonResponse({ success: true, data: [] }));
			}

			return Promise.resolve(
				new Response('<!doctype html><h1>Not found</h1>', {
					status: 404,
					headers: { 'Content-Type': 'text/html' }
				})
			);
		});

		const data = await load({ fetch } as never);

		expect(fetch).toHaveBeenCalledWith('/api/captaciones/pendientes');
		expect(fetch).not.toHaveBeenCalledWith('/api/integraciones/captaciones/pendientes');
		expect(data).toMatchObject({ captacionesCount: 1 });
	});

	it('no convierte una respuesta HTML de un proxy roto en un 500 SSR', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const fetch = vi.fn((url: string | URL | Request) => {
			const path = String(url);

			if (path === '/api/captaciones/pendientes') {
				return Promise.resolve(
					new Response('<!doctype html><h1>Not found</h1>', {
						status: 404,
						headers: { 'Content-Type': 'text/html' }
					})
				);
			}

			return Promise.resolve(jsonResponse({ success: true, data: [] }));
		});

		await expect(load({ fetch } as never)).resolves.toMatchObject({
			leads: [],
			propiedadesDisponibles: [],
			asesores: [],
			captacionesCount: 0,
			clientes: []
		});

		warn.mockRestore();
	});
});
