import { httpClient } from '$lib/shared/http/httpClient';
import type { ActualizarClienteInput } from '../application/use-cases/actualizarCliente';
import type { ClienteRepository } from '../application/ports/ClienteRepository';
import type { RegistrarClienteInput } from '../application/use-cases/registrarCliente';
import type { Cliente } from '../domain/models/Cliente';
import { mapClienteFromDto } from './ClienteMapper';
import type {
	ActualizarClienteRequestDTO,
	ApiSuccessResponse,
	ClienteDTO,
	ClienteOutputDTO,
	RegistrarClienteRequestDTO,
	RegistrarClienteResponseDTO
} from './dto/ClienteDTOs';

export class HttpClienteRepository implements ClienteRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async listarClientes(): Promise<Cliente[]> {
		const response = await httpClient.get<ApiSuccessResponse<ClienteDTO[]>>(
			`${this.apiBaseUrl}/ventas/clientes`
		);

		return response.data.map(mapClienteFromDto);
	}

	async obtenerCliente(id: string): Promise<Cliente> {
		const response = await httpClient.get<ApiSuccessResponse<ClienteOutputDTO>>(
			`${this.apiBaseUrl}/ventas/cliente/${encodeURIComponent(id)}`
		);
		return mapClienteFromDto(response.data);
	}

	async registrarCliente(input: RegistrarClienteInput): Promise<string> {
		const body: RegistrarClienteRequestDTO = {
			nombre: input.nombre,
			email: input.email,
			telefono: input.telefono
		};
		const response = await httpClient.post<ApiSuccessResponse<RegistrarClienteResponseDTO>>(
			`${this.apiBaseUrl}/ventas/cliente`,
			{ body }
		);

		return response.data.id;
	}

	async actualizarCliente(input: ActualizarClienteInput): Promise<Cliente> {
		const body: ActualizarClienteRequestDTO = {
			nombre: input.nombre || undefined,
			email: input.email || undefined,
			telefono: input.telefono || undefined
		};
		const response = await httpClient.put<ApiSuccessResponse<ClienteOutputDTO>>(
			`${this.apiBaseUrl}/ventas/cliente/${encodeURIComponent(input.idCliente)}`,
			{ body }
		);
		return mapClienteFromDto(response.data);
	}
}
