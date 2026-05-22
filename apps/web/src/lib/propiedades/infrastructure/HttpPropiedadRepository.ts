import type { PropiedadRepository } from '../application/ports/PropiedadRepository';
import type { ActualizarPropiedadInput } from '../application/use-cases/actualizarPropiedad';
import type { CrearPropiedadInput } from '../application/use-cases/crearPropiedad';
import type { Propiedad } from '../domain/models/Propiedad';
import { httpClient } from '$lib/shared/http/httpClient';
import { mapPropiedadFromDto } from './PropiedadMapper';
import type {
	ApiSuccessResponse,
	ActualizarPropiedadRequestDTO,
	CrearPropiedadRequestDTO,
	CrearPropiedadResponseDTO,
	PropiedadRespuestaDTO
} from './dto/PropiedadDTOs';

export class HttpPropiedadRepository implements PropiedadRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async listar(): Promise<Propiedad[]> {
		const response = await httpClient.get<ApiSuccessResponse<PropiedadRespuestaDTO[]>>(
			`${this.apiBaseUrl}/propiedades`
		);

		return response.data.map(mapPropiedadFromDto);
	}

	async crear(input: CrearPropiedadInput): Promise<string> {
		const body: CrearPropiedadRequestDTO = {
			titulo: input.titulo,
			descripcion: input.descripcion,
			precio: input.precio,
			origen: 'ALVAS',
			estado: input.estado,
			asesorResponsableId: input.asesorResponsableId || undefined
		};
		const response = await httpClient.post<ApiSuccessResponse<CrearPropiedadResponseDTO>>(
			`${this.apiBaseUrl}/propiedades`,
			{ body }
		);

		return response.data.id;
	}

	async actualizar(input: ActualizarPropiedadInput): Promise<void> {
		const body: ActualizarPropiedadRequestDTO = {
			titulo: input.titulo,
			descripcion: input.descripcion,
			precio: input.precio,
			estado: input.estado,
			asesorResponsableId: input.asesorResponsableId || undefined
		};

		await httpClient.put<ApiSuccessResponse<{ message?: string }>>(
			`${this.apiBaseUrl}/propiedades/${input.id}`,
			{ body }
		);
	}
}
