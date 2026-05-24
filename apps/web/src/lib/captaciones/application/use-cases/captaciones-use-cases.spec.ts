import { describe, expect, it, vi } from 'vitest';
import {
	convertirCaptacion,
	marcarCaptacionDuplicada,
	rechazarCaptacion,
	revisarCaptacion
} from './gestionarCaptacionPendiente';
import { listarCaptacionesPendientes } from './listarCaptacionesPendientes';
import { registrarCaptacionVendedor } from './registrarCaptacionVendedor';
import type { CaptacionRepository } from '../ports/CaptacionRepository';

function crearRepositoryFake(): CaptacionRepository {
	return {
		registrarVendedor: vi.fn().mockResolvedValue({
			idLead: 'lead-1',
			idPropiedadPreliminar: 'propiedad-1'
		}),
		listarPendientes: vi.fn().mockResolvedValue([{ id: 'captacion-1', estado: 'PENDIENTE' }]),
		revisar: vi.fn().mockResolvedValue({ id: 'captacion-1', estado: 'REVISADA' }),
		marcarDuplicada: vi.fn().mockResolvedValue({ id: 'captacion-1', estado: 'DUPLICADA' }),
		rechazar: vi.fn().mockResolvedValue({ id: 'captacion-1', estado: 'RECHAZADA' }),
		convertir: vi.fn().mockResolvedValue({
			idLead: 'lead-1',
			captacion: { id: 'captacion-1', estado: 'CONVERTIDA' }
		})
	} as unknown as CaptacionRepository;
}

describe('captaciones / application use cases', () => {
	it('registra una captacion de vendedor mediante el puerto', async () => {
		const repository = crearRepositoryFake();

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

	it('lista y gestiona captaciones pendientes mediante el puerto', async () => {
		const repository = crearRepositoryFake();

		await expect(listarCaptacionesPendientes(repository)).resolves.toEqual([
			{ id: 'captacion-1', estado: 'PENDIENTE' }
		]);
		await expect(revisarCaptacion(repository, 'captacion-1')).resolves.toMatchObject({
			estado: 'REVISADA'
		});
		await expect(
			marcarCaptacionDuplicada(repository, 'captacion-1', 'Telefono repetido')
		).resolves.toMatchObject({
			estado: 'DUPLICADA'
		});
		await expect(
			rechazarCaptacion(repository, 'captacion-1', 'Sin intencion')
		).resolves.toMatchObject({
			estado: 'RECHAZADA'
		});
		await expect(convertirCaptacion(repository, 'captacion-1', 'asesor-1')).resolves.toMatchObject({
			idLead: 'lead-1',
			captacion: { estado: 'CONVERTIDA' }
		});
	});
});
