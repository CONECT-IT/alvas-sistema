import type { LeadPipeline } from '../domain/models/LeadPipeline';
import type { LeadPipelineDTO } from './dto/VentasDTOs';

export function mapLeadPipelineFromDto(dto: LeadPipelineDTO): LeadPipeline {
	return {
		id: dto.id,
		nombre: dto.nombre,
		estado: dto.estado,
		tipo: dto.tipo,
		idAsesor: dto.idAsesor,
		nombreAsesor: dto.nombreAsesor,
		citasCount: dto.citasCount,
		citas: (dto.citas ?? []).map((cita) => ({
			id: cita.id,
			idLead: cita.idLead,
			idPropiedad: cita.idPropiedad,
			fechaInicio: cita.fechaInicio,
			fechaFin: cita.fechaFin,
			estado: cita.estado,
			observacion: cita.observacion
		}))
	};
}
