import type { CaptacionRepository } from '../ports/CaptacionRepository';

export function listarCaptacionesPendientes(repository: CaptacionRepository) {
	return repository.listarPendientes();
}
