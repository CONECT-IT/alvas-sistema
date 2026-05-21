import { httpClient } from '$lib/shared/http/httpClient';
import type { UsuarioRepository } from '../application/ports/UsuarioRepository';
import type { Usuario } from '../domain/models/Usuario';
import { mapUsuarioFromDto } from './UsuarioMapper';
import type { ApiSuccessResponse, UsuarioRespuestaDTO } from './dto/UsuarioDTOs';

export class HttpUsuarioRepository implements UsuarioRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async listar(): Promise<Usuario[]> {
		const response = await httpClient.get<ApiSuccessResponse<UsuarioRespuestaDTO[]>>(
			`${this.apiBaseUrl}/usuarios`
		);

		return response.data.map(mapUsuarioFromDto);
	}
}
