import type { Cliente } from '../domain/models/Cliente';
import type { ClienteDTO } from './dto/ClienteDTOs';

export function mapClienteFromDto(dto: ClienteDTO): Cliente {
	return {
		id: dto.id,
		nombre: dto.nombre,
		email: dto.email,
		telefono: dto.telefono,
		idAsesor: dto.idAsesor,
		nombreAsesor: dto.nombreAsesor,
		idLeadOrigen: dto.idLeadOrigen,
		nombreLead: dto.nombreLead,
		creadoEn: dto.creadoEn,
		actualizadoEn: dto.actualizadoEn
	};
}
