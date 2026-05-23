import type { Propiedad } from '../../domain/models/Propiedad';
import type { PropiedadRepository } from '../ports/PropiedadRepository';

export function obtenerPropiedad(
	repository: PropiedadRepository,
	id: string
): Promise<Propiedad | null> {
	return repository.obtener(id);
}
