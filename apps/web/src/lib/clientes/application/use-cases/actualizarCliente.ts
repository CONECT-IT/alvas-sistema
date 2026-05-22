import type { ClienteRepository } from '../ports/ClienteRepository';

export type ActualizarClienteInput = Readonly<{
	idCliente: string;
	nombre?: string;
	email?: string;
	telefono?: string;
}>;

export function actualizarCliente(repository: ClienteRepository, input: ActualizarClienteInput) {
	return repository.actualizarCliente(input);
}
