import type { VentasRepository } from '../ports/VentasRepository';

export function firmarContrato(repository: VentasRepository, idContrato: string) {
	return repository.firmarContrato(idContrato);
}
