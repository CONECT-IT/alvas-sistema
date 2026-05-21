import type { VentasRepository } from '../ports/VentasRepository';

export function listarPipeline(repository: VentasRepository) {
	return repository.listarPipeline();
}
