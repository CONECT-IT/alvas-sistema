import type { VentasRepository } from '../ports/VentasRepository';
import type { ContratoDTO } from '../../infrastructure/dto/VentasDTOs';

export function listarContratos(repository: VentasRepository): Promise<ContratoDTO[]> {
	return repository.listarContratos();
}
