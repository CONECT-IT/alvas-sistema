import type { Cliente } from '../../domain/models/Cliente';
import type { ActualizarClienteInput } from '../use-cases/actualizarCliente';
import type { RegistrarClienteInput } from '../use-cases/registrarCliente';

export interface ClienteRepository {
	listarClientes(): Promise<Cliente[]>;
	obtenerCliente(id: string): Promise<Cliente>;
	registrarCliente(input: RegistrarClienteInput): Promise<string>;
	actualizarCliente(input: ActualizarClienteInput): Promise<Cliente>;
}
