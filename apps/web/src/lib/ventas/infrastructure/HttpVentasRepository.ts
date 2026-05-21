import { httpClient } from '$lib/shared/http/httpClient';
import type { VentasRepository } from '../application/ports/VentasRepository';
import type { LeadPipeline } from '../domain/models/LeadPipeline';
import { mapLeadPipelineFromDto } from './VentasMapper';
import type { ApiSuccessResponse, LeadPipelineDTO } from './dto/VentasDTOs';

export class HttpVentasRepository implements VentasRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async listarPipeline(): Promise<LeadPipeline[]> {
		const response = await httpClient.get<ApiSuccessResponse<LeadPipelineDTO[]>>(
			`${this.apiBaseUrl}/ventas/pipeline`
		);

		return response.data.map(mapLeadPipelineFromDto);
	}
}
