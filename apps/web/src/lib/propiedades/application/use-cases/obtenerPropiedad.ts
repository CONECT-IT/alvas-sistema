import { httpClient } from '$lib/shared/http/httpClient';
import type { Propiedad } from '../../domain/models/Propiedad';
import { mapPropiedadFromDto } from '../../infrastructure/PropiedadMapper';
import type {
	ApiSuccessResponse,
	PropiedadRespuestaDTO
} from '../../infrastructure/dto/PropiedadDTOs';

export async function obtenerPropiedad(repository: any, id: string): Promise<Propiedad | null> {
	const res = await httpClient.get<ApiSuccessResponse<PropiedadRespuestaDTO[]>>(`/api/propiedades`);
	const item = (res.data ?? []).find((p) => p.id === id);
	return item ? mapPropiedadFromDto(item) : null;
}
