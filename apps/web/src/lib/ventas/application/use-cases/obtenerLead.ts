import type { VentasRepository } from '../ports/VentasRepository';

export function obtenerLead(repository: VentasRepository, id: string) {
	return repository.obtenerLead(id);
}
