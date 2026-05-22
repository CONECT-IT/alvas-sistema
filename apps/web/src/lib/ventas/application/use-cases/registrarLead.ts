import type { VentasRepository } from '../ports/VentasRepository';

export type RegistrarLeadInput = Readonly<{
	nombre: string;
	email: string;
	telefono: string;
	tipo: 'COMPRA' | 'VENTA';
	idPropiedadInteres?: string;
}>;

export function registrarLead(repository: VentasRepository, input: RegistrarLeadInput) {
	return repository.registrarLead(input);
}
