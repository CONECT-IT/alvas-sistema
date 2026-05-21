import type { Propiedad } from '../../domain/models/Propiedad';
import type { PropiedadRepository } from '../ports/PropiedadRepository';

export function listarPropiedades(repository: PropiedadRepository): Promise<Propiedad[]> {
	return repository.listar();
}
