import { describe, expect, it, vi } from 'vitest';
import { actualizarCliente } from '$lib/clientes/application/use-cases/actualizarCliente';
import { listarClientes } from '$lib/clientes/application/use-cases/listarClientes';
import { obtenerCliente } from '$lib/clientes/application/use-cases/obtenerCliente';
import { registrarCliente } from '$lib/clientes/application/use-cases/registrarCliente';
import type { ClienteRepository } from '$lib/clientes/application/ports/ClienteRepository';

function crearClienteRepositoryFake(): ClienteRepository {
	const cliente = {
		id: 'cliente-1',
		nombre: 'Ana Cliente',
		email: 'ana@example.com',
		telefono: '3001234567',
		idAsesor: 'asesor-1',
		creadoEn: '2026-05-23T00:00:00.000Z',
		actualizadoEn: '2026-05-23T00:00:00.000Z'
	};

	return {
		listarClientes: vi.fn().mockResolvedValue([cliente]),
		obtenerCliente: vi.fn().mockResolvedValue(cliente),
		registrarCliente: vi.fn().mockResolvedValue('cliente-1'),
		actualizarCliente: vi.fn().mockResolvedValue({ ...cliente, nombre: 'Ana Actualizada' })
	};
}

describe('clientes / application use cases', () => {
	it('delega consultas de clientes al puerto', async () => {
		const repository = crearClienteRepositoryFake();

		await expect(listarClientes(repository)).resolves.toHaveLength(1);
		await expect(obtenerCliente(repository, 'cliente-1')).resolves.toEqual(
			expect.objectContaining({ nombre: 'Ana Cliente' })
		);

		expect(repository.listarClientes).toHaveBeenCalledOnce();
		expect(repository.obtenerCliente).toHaveBeenCalledWith('cliente-1');
	});

	it('delega registro y actualizacion de clientes al puerto', async () => {
		const repository = crearClienteRepositoryFake();

		await expect(
			registrarCliente(repository, {
				nombre: 'Ana Cliente',
				email: 'ana@example.com',
				telefono: '3001234567'
			})
		).resolves.toBe('cliente-1');
		await actualizarCliente(repository, {
			idCliente: 'cliente-1',
			nombre: 'Ana Actualizada'
		});

		expect(repository.registrarCliente).toHaveBeenCalledOnce();
		expect(repository.actualizarCliente).toHaveBeenCalledWith({
			idCliente: 'cliente-1',
			nombre: 'Ana Actualizada'
		});
	});
});
