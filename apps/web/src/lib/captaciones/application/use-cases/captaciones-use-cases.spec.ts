import { describe, expect, it, vi } from 'vitest';
import { registrarCaptacionVendedor } from './registrarCaptacionVendedor';
import type { CaptacionRepository } from '../ports/CaptacionRepository';

describe('captaciones / application use cases', () => {
	it('registra una captacion de vendedor mediante el puerto', async () => {
		const repository: CaptacionRepository = {
			registrarVendedor: vi.fn().mockResolvedValue({
				idLead: 'lead-1',
				idPropiedadPreliminar: 'propiedad-1'
			})
		};

		await expect(
			registrarCaptacionVendedor(repository, {
				nombre: 'Ana Vendedora',
				telefono: '3001234567',
				tituloPropiedad: 'Casa Centro',
				descripcionPropiedad: 'Casa para vender',
				precioEstimado: 120000
			})
		).resolves.toEqual({
			idLead: 'lead-1',
			idPropiedadPreliminar: 'propiedad-1'
		});

		expect(repository.registrarVendedor).toHaveBeenCalledOnce();
	});
});
