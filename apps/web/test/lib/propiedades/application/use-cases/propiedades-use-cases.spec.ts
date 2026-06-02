import { describe, expect, it, vi } from 'vitest';
import { actualizarPropiedad } from '$lib/propiedades/application/use-cases/actualizarPropiedad';
import { crearPropiedad } from '$lib/propiedades/application/use-cases/crearPropiedad';
import { listarPropiedades } from '$lib/propiedades/application/use-cases/listarPropiedades';
import { obtenerPropiedad } from '$lib/propiedades/application/use-cases/obtenerPropiedad';
import type { PropiedadRepository } from '$lib/propiedades/application/ports/PropiedadRepository';

function crearPropiedadRepositoryFake(): PropiedadRepository {
	const propiedad = {
		id: 'propiedad-1',
		titulo: 'Casa Centro',
		descripcion: 'Casa disponible para venta',
		precio: 120000,
		origen: 'MANUAL',
		estado: 'DISPONIBLE'
	};

	return {
		listar: vi.fn().mockResolvedValue([propiedad]),
		obtener: vi.fn().mockResolvedValue(propiedad),
		crear: vi.fn().mockResolvedValue('propiedad-1'),
		actualizar: vi.fn().mockResolvedValue(undefined)
	};
}

describe('propiedades / application use cases', () => {
	it('delega consultas de propiedades al puerto', async () => {
		const repository = crearPropiedadRepositoryFake();

		await expect(listarPropiedades(repository)).resolves.toHaveLength(1);
		await expect(obtenerPropiedad(repository, 'propiedad-1')).resolves.toEqual(
			expect.objectContaining({ estado: 'DISPONIBLE' })
		);

		expect(repository.listar).toHaveBeenCalledOnce();
		expect(repository.obtener).toHaveBeenCalledWith('propiedad-1');
	});

	it('delega creacion y actualizacion de propiedades al puerto', async () => {
		const repository = crearPropiedadRepositoryFake();

		await expect(
			crearPropiedad(repository, {
				titulo: 'Casa Centro',
				descripcion: 'Casa disponible para venta',
				precio: 120000,
				estado: 'DISPONIBLE'
			})
		).resolves.toBe('propiedad-1');
		await actualizarPropiedad(repository, {
			id: 'propiedad-1',
			estado: 'RESERVADA'
		});

		expect(repository.crear).toHaveBeenCalledOnce();
		expect(repository.actualizar).toHaveBeenCalledWith({
			id: 'propiedad-1',
			estado: 'RESERVADA'
		});
	});
});
