import type { PropiedadRepository } from '../ports/PropiedadRepository';

export type CrearPropiedadInput = Readonly<{
	titulo: string;
	descripcion: string;
	precio: number;
	estado: string;
	asesorResponsableId?: string;
}>;

export function crearPropiedad(repository: PropiedadRepository, input: CrearPropiedadInput) {
	return repository.crear(input);
}
