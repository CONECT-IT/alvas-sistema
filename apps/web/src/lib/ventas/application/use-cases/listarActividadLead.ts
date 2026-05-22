import type { VentasRepository } from '../ports/VentasRepository';

export function listarActividadLead(repository: VentasRepository, idLead: string) {
	return repository.listarActividadLead(idLead);
}
