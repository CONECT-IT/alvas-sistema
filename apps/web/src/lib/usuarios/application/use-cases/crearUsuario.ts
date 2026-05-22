import type { UserRol } from '$lib/auth/domain/models/User';
import type { UsuarioRepository } from '../ports/UsuarioRepository';

export type CrearUsuarioInput = Readonly<{
	idUsuario: string;
	username: string;
	nombre: string;
	clave: string;
	rol: UserRol;
}>;

export function crearUsuario(repository: UsuarioRepository, input: CrearUsuarioInput) {
	return repository.crear(input);
}
