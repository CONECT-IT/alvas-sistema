import { describe, expect, it, vi } from 'vitest';
import { actualizarUsuario } from '$lib/usuarios/application/use-cases/actualizarUsuario';
import { crearUsuario } from '$lib/usuarios/application/use-cases/crearUsuario';
import { listarUsuarios } from '$lib/usuarios/application/use-cases/listarUsuarios';
import { obtenerUsuario } from '$lib/usuarios/application/use-cases/obtenerUsuario';
import type { UsuarioRepository } from '$lib/usuarios/application/ports/UsuarioRepository';

function crearUsuarioRepositoryFake(): UsuarioRepository {
	const usuario = {
		id: 'usuario-1',
		username: 'asesor',
		nombre: 'Asesor Uno',
		rol: 'ASESOR' as const,
		estado: 'ACTIVO'
	};

	return {
		listar: vi.fn().mockResolvedValue([usuario]),
		crear: vi.fn().mockResolvedValue(usuario),
		actualizar: vi.fn().mockResolvedValue({ ...usuario, nombre: 'Asesor Actualizado' }),
		obtener: vi.fn().mockResolvedValue(usuario)
	};
}

describe('usuarios / application use cases', () => {
	it('delega consultas de usuarios al puerto', async () => {
		const repository = crearUsuarioRepositoryFake();

		await expect(listarUsuarios(repository)).resolves.toHaveLength(1);
		await expect(obtenerUsuario(repository, 'usuario-1')).resolves.toEqual(
			expect.objectContaining({ username: 'asesor' })
		);

		expect(repository.listar).toHaveBeenCalledOnce();
		expect(repository.obtener).toHaveBeenCalledWith('usuario-1');
	});

	it('delega creacion y actualizacion al puerto de usuarios', async () => {
		const repository = crearUsuarioRepositoryFake();

		await crearUsuario(repository, {
			idUsuario: 'usuario-1',
			username: 'asesor',
			nombre: 'Asesor Uno',
			clave: 'clave-segura',
			rol: 'ASESOR'
		});
		await actualizarUsuario(repository, {
			idUsuario: 'usuario-1',
			username: 'asesor.actualizado',
			clave: 'clave-segura'
		});

		expect(repository.crear).toHaveBeenCalledOnce();
		expect(repository.actualizar).toHaveBeenCalledWith({
			idUsuario: 'usuario-1',
			username: 'asesor.actualizado',
			clave: 'clave-segura'
		});
	});
});
