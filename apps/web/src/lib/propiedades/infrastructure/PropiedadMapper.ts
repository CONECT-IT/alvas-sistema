import type { Propiedad } from '../domain/models/Propiedad';
import type { PropiedadRespuestaDTO } from './dto/PropiedadDTOs';

export function mapPropiedadFromDto(dto: PropiedadRespuestaDTO): Propiedad {
	return {
		id: dto.id,
		titulo: dto.titulo,
		descripcion: dto.descripcion,
		precio: dto.precio,
		origen: dto.origen,
		estado: dto.estado,
		idLeadOrigen: dto.idLeadOrigen,
		idClientePropietario: dto.idClientePropietario,
		captadaPorAsesorId: dto.captadaPorAsesorId,
		asesorResponsableId: dto.asesorResponsableId
	};
}
