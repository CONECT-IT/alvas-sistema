import type { CaptacionVendedor } from '../../domain/models/CaptacionVendedor';
import type { CaptacionRepository } from '../ports/CaptacionRepository';

export function registrarCaptacionVendedor(
	repository: CaptacionRepository,
	input: CaptacionVendedor
) {
	return repository.registrarVendedor(input);
}
