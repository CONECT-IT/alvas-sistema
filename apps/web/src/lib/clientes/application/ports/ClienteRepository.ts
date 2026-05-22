import type { Cliente } from '../../domain/models/Cliente';
import type { RegistrarClienteInput } from '../use-cases/registrarCliente';

export interface ClienteRepository {
	listarClientes(): Promise<Cliente[]>;
	registrarCliente(input: RegistrarClienteInput): Promise<string>;
}
