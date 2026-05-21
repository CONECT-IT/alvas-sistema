import { httpClient } from '$lib/shared/http/httpClient';
import type { ReporteRepository } from '../application/ports/ReporteRepository';
import type { EstadisticasGlobales, ReporteGeneral } from '../domain/models/ReporteGeneral';
import type {
	ApiSuccessResponse,
	EstadisticasGlobalesDTO,
	ReporteGeneralDTO
} from './dto/ReporteDTOs';

export class HttpReporteRepository implements ReporteRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async obtenerEstadisticasGlobales(): Promise<EstadisticasGlobales> {
		const response = await httpClient.get<ApiSuccessResponse<EstadisticasGlobalesDTO>>(
			`${this.apiBaseUrl}/reportes/estadisticas-globales`
		);

		return response.data;
	}

	async obtenerReporteGeneral(): Promise<ReporteGeneral> {
		const response = await httpClient.get<ApiSuccessResponse<ReporteGeneralDTO>>(
			`${this.apiBaseUrl}/reportes/general`
		);

		return response.data;
	}
}
