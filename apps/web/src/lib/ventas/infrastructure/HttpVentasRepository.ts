import { httpClient } from '$lib/shared/http/httpClient';
import type { VentasRepository } from '../application/ports/VentasRepository';
import type { AgendarCitaInput } from '../application/use-cases/agendarCita';
import type { RegistrarLeadInput } from '../application/use-cases/registrarLead';
import type { LeadPipeline } from '../domain/models/LeadPipeline';
import { mapLeadPipelineFromDto } from './VentasMapper';
import type {
	AgendarCitaRequestDTO,
	ApiSuccessResponse,
	LeadPipelineDTO,
	RegistrarLeadRequestDTO,
	RegistrarLeadResponseDTO
} from './dto/VentasDTOs';

export class HttpVentasRepository implements VentasRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async listarPipeline(): Promise<LeadPipeline[]> {
		const response = await httpClient.get<ApiSuccessResponse<LeadPipelineDTO[]>>(
			`${this.apiBaseUrl}/ventas/pipeline`
		);

		return response.data.map(mapLeadPipelineFromDto);
	}

	async registrarLead(input: RegistrarLeadInput): Promise<string> {
		const body: RegistrarLeadRequestDTO = {
			nombre: input.nombre,
			email: input.email,
			telefono: input.telefono,
			tipo: input.tipo,
			idPropiedadInteres: input.idPropiedadInteres || undefined
		};
		const response = await httpClient.post<ApiSuccessResponse<RegistrarLeadResponseDTO>>(
			`${this.apiBaseUrl}/ventas/lead`,
			{ body }
		);

		return response.data.id;
	}

	async agendarCita(input: AgendarCitaInput): Promise<void> {
		const body: AgendarCitaRequestDTO = {
			idLead: input.idLead,
			idPropiedad: input.idPropiedad || undefined,
			fechaInicio: input.fechaInicio,
			duracionMinutos: input.duracionMinutos,
			observacion: input.observacion || undefined
		};

		await httpClient.post<ApiSuccessResponse<{ message?: string }>>(
			`${this.apiBaseUrl}/ventas/cita`,
			{ body }
		);
	}
}
