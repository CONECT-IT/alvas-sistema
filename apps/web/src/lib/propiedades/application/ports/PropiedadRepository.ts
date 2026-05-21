import type { Propiedad } from '../../domain/models/Propiedad';

export interface PropiedadRepository {
	listar(): Promise<Propiedad[]>;
}
