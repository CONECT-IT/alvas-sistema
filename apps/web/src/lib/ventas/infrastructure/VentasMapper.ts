import type { LeadPipeline } from '../domain/models/LeadPipeline';
import type { LeadPipelineDTO } from './dto/VentasDTOs';

export function mapLeadPipelineFromDto(dto: LeadPipelineDTO): LeadPipeline {
	return {
		id: dto.id,
		nombre: dto.nombre,
		estado: dto.estado,
		tipo: dto.tipo,
		citasCount: dto.citasCount
	};
}
