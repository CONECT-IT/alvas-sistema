import type { ClienteRepository } from '../ports/ClienteRepository';

export function obtenerCliente(repository: ClienteRepository, id: string) {
	return repository.obtenerCliente(id);
}
