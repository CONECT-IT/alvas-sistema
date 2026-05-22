import type { VentasRepository } from '../ports/VentasRepository';

export type EstadoCita = 'PENDIENTE' | 'REALIZADA' | 'CANCELADA' | 'REPROGRAMADA';

export type ActualizarCitaInput = Readonly<{
	idLead: string;
	idCita: string;
	fechaInicio?: string;
	duracionMinutos?: number;
	observacion?: string;
	estado?: EstadoCita;
}>;

export function actualizarCita(repository: VentasRepository, input: ActualizarCitaInput) {
	return repository.actualizarCita(input);
}
