import type { UsuarioRepository } from '../ports/UsuarioRepository';

export function obtenerUsuario(repository: UsuarioRepository, id: string) {
	return repository.obtener(id);
}
