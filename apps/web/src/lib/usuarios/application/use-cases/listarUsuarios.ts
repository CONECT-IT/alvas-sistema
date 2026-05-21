import type { UsuarioRepository } from '../ports/UsuarioRepository';

export function listarUsuarios(repository: UsuarioRepository) {
	return repository.listar();
}
