import type { Propiedad } from '../../domain/models/Propiedad';
import type { CrearPropiedadInput } from '../use-cases/crearPropiedad';

export interface PropiedadRepository {
	listar(): Promise<Propiedad[]>;
	crear(input: CrearPropiedadInput): Promise<string>;
}
