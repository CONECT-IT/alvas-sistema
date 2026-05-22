import type { UserRol } from '$lib/auth/domain/models/User';
import type { UsuarioRepository } from '../ports/UsuarioRepository';

export type ActualizarUsuarioInput = Readonly<{
	idUsuario: string;
	username?: string;
	nombre?: string;
	rol?: UserRol;
}>;

export function actualizarUsuario(repository: UsuarioRepository, input: ActualizarUsuarioInput) {
	return repository.actualizar(input);
}
