import type { VentasRepository } from '../ports/VentasRepository';

export type ConvertirLeadInput = Readonly<{
	idLead: string;
}>;

export function convertirLead(repository: VentasRepository, input: ConvertirLeadInput) {
	return repository.convertirLead(input);
}
