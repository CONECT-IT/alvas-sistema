import type { ClienteRepository } from '../ports/ClienteRepository';

export type RegistrarClienteInput = Readonly<{
	nombre: string;
	email: string;
	telefono: string;
}>;

export function registrarCliente(repository: ClienteRepository, input: RegistrarClienteInput) {
	return repository.registrarCliente(input);
}
