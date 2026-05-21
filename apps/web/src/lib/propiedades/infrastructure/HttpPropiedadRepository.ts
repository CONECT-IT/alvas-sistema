import type { PropiedadRepository } from '../application/ports/PropiedadRepository';
import type { Propiedad } from '../domain/models/Propiedad';
import { httpClient } from '$lib/shared/http/httpClient';
import { mapPropiedadFromDto } from './PropiedadMapper';
import type { ApiSuccessResponse, PropiedadRespuestaDTO } from './dto/PropiedadDTOs';

export class HttpPropiedadRepository implements PropiedadRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async listar(): Promise<Propiedad[]> {
		const response = await httpClient.get<ApiSuccessResponse<PropiedadRespuestaDTO[]>>(
			`${this.apiBaseUrl}/propiedades`
		);

		return response.data.map(mapPropiedadFromDto);
	}
}
