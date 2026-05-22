import type { VentasRepository } from '../ports/VentasRepository';

export type CrearContratoInput = {
	idLead: string;
	idPropiedad: string;
	fechaInicio: string;
	fechaFin: string;
};

export function crearContrato(repository: VentasRepository, input: CrearContratoInput) {
	return repository.crearContrato(input);
}
