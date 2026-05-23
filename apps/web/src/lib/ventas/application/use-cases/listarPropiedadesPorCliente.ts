import type { VentasRepository } from '../ports/VentasRepository';

export function listarPropiedadesPorCliente(repository: VentasRepository, idLead: string) {
	return repository.listarPropiedadesPorCliente(idLead);
}
