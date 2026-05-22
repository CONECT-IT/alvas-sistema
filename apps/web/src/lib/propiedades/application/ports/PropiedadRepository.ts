import type { Propiedad } from '../../domain/models/Propiedad';
import type { ActualizarPropiedadInput } from '../use-cases/actualizarPropiedad';
import type { CrearPropiedadInput } from '../use-cases/crearPropiedad';

export interface PropiedadRepository {
	listar(): Promise<Propiedad[]>;
	crear(input: CrearPropiedadInput): Promise<string>;
	actualizar(input: ActualizarPropiedadInput): Promise<void>;
}
