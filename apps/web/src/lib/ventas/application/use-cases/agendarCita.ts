import type { VentasRepository } from '../ports/VentasRepository';

export type AgendarCitaInput = Readonly<{
	idLead: string;
	idPropiedad?: string;
	fechaInicio: string;
	duracionMinutos: number;
	observacion?: string;
}>;

export function agendarCita(repository: VentasRepository, input: AgendarCitaInput) {
	return repository.agendarCita(input);
}
