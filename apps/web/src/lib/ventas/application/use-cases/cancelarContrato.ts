import type { VentasRepository } from '../ports/VentasRepository';

export function cancelarContrato(repository: VentasRepository, idContrato: string) {
	return repository.cancelarContrato(idContrato);
}
