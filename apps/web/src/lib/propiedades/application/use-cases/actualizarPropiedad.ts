import type { PropiedadRepository } from '../ports/PropiedadRepository';

export type ActualizarPropiedadInput = Readonly<{
	id: string;
	estado?: string;
	titulo?: string;
	descripcion?: string;
	precio?: number;
	asesorResponsableId?: string;
}>;

export function actualizarPropiedad(
	repository: PropiedadRepository,
	input: ActualizarPropiedadInput
) {
	return repository.actualizar(input);
}
