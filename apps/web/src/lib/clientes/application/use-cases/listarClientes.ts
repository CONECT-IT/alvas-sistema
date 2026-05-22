import type { ClienteRepository } from '../ports/ClienteRepository';

export function listarClientes(repository: ClienteRepository) {
	return repository.listarClientes();
}
