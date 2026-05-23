import { httpClient } from '$lib/shared/http/httpClient';
import type { UsuarioRepository } from '../application/ports/UsuarioRepository';
import type { ActualizarUsuarioInput } from '../application/use-cases/actualizarUsuario';
import type { CrearUsuarioInput } from '../application/use-cases/crearUsuario';
import type { Usuario } from '../domain/models/Usuario';
import { mapUsuarioFromDto } from './UsuarioMapper';
import type {
	ActualizarUsuarioRequestDTO,
	ApiSuccessResponse,
	CrearUsuarioRequestDTO,
	UsuarioRespuestaDTO
} from './dto/UsuarioDTOs';

export class HttpUsuarioRepository implements UsuarioRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async listar(): Promise<Usuario[]> {
		const response = await httpClient.get<ApiSuccessResponse<UsuarioRespuestaDTO[]>>(
			`${this.apiBaseUrl}/usuarios`
		);

		return response.data.map(mapUsuarioFromDto);
	}

	async crear(input: CrearUsuarioInput): Promise<Usuario> {
		const body: CrearUsuarioRequestDTO = {
			idUsuario: input.idUsuario,
			username: input.username,
			nombre: input.nombre,
			clave: input.clave,
			rol: input.rol
		};
		const response = await httpClient.post<ApiSuccessResponse<UsuarioRespuestaDTO>>(
			`${this.apiBaseUrl}/usuarios`,
			{ body }
		);

		return mapUsuarioFromDto(response.data);
	}

	async actualizar(input: ActualizarUsuarioInput): Promise<Usuario> {
		const body: ActualizarUsuarioRequestDTO = {
			username: input.username,
			nombre: input.nombre,
			rol: input.rol,
			estado: input.estado
		};
		const response = await httpClient.put<ApiSuccessResponse<UsuarioRespuestaDTO>>(
			`${this.apiBaseUrl}/usuarios/${encodeURIComponent(input.idUsuario)}`,
			{ body }
		);

		return mapUsuarioFromDto(response.data);
	}

	async obtener(id: string): Promise<Usuario> {
		const response = await httpClient.get<ApiSuccessResponse<UsuarioRespuestaDTO>>(
			`${this.apiBaseUrl}/usuarios/${encodeURIComponent(id)}`
		);

		return mapUsuarioFromDto(response.data);
	}
}
