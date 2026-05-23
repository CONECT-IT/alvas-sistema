import type { VentasRepository } from '../ports/VentasRepository';

export type ActualizarLeadInput = Readonly<{
	idLead: string;
	nombre?: string;
	email?: string;
	telefono?: string;
	tipo?: 'COMPRA' | 'VENTA';
	idPropiedadInteres?: string;
	estado?: string;
}>;

export function actualizarLead(repository: VentasRepository, input: ActualizarLeadInput) {
	return repository.actualizarLead(input);
}
