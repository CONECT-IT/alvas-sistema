import { httpClient } from '$lib/shared/http/httpClient';
import type { CaptacionRepository } from '../application/ports/CaptacionRepository';
import type { CaptacionConvertida, CaptacionPendiente } from '../domain/models/CaptacionPendiente';
import type { CaptacionVendedor } from '../domain/models/CaptacionVendedor';
import type {
	ApiSuccessResponse,
	CaptacionConvertidaDTO,
	CaptacionPendienteDTO,
	CaptacionProcesadaDTO,
	CaptacionVendedorRequestDTO
} from './dto/CaptacionDTOs';

export class HttpCaptacionRepository implements CaptacionRepository {
	constructor(private readonly apiBaseUrl: string) {}

	async registrarVendedor(input: CaptacionVendedor): Promise<CaptacionProcesadaDTO> {
		const metadata: Record<string, string> = {
			tituloPropiedad: input.tituloPropiedad,
			descripcionPropiedad: input.descripcionPropiedad
		};

		if (input.precioEstimado !== undefined) {
			metadata.precioEstimado = String(input.precioEstimado);
		}

		const body: CaptacionVendedorRequestDTO = {
			canal: 'FORMULARIO_WEB',
			origen: 'Landing ALVAS',
			nombre: input.nombre,
			telefono: input.telefono,
			email: input.email || undefined,
			tipo: 'VENTA',
			metadata
		};
		const response = await httpClient.post<ApiSuccessResponse<CaptacionProcesadaDTO>>(
			`${this.apiBaseUrl}/captaciones`,
			{ body }
		);

		return response.data;
	}

	async listarPendientes(): Promise<CaptacionPendiente[]> {
		const response = await httpClient.get<ApiSuccessResponse<CaptacionPendienteDTO[]>>(
			`${this.apiBaseUrl}/captaciones/pendientes`
		);

		return response.data;
	}

	async revisar(idCaptacion: string): Promise<CaptacionPendiente> {
		const response = await httpClient.post<ApiSuccessResponse<CaptacionPendienteDTO>>(
			`${this.apiBaseUrl}/captaciones/pendientes/${encodeURIComponent(idCaptacion)}/revisar`
		);

		return response.data;
	}

	async marcarDuplicada(idCaptacion: string, razon: string): Promise<CaptacionPendiente> {
		const response = await httpClient.post<ApiSuccessResponse<CaptacionPendienteDTO>>(
			`${this.apiBaseUrl}/captaciones/pendientes/${encodeURIComponent(idCaptacion)}/duplicada`,
			{ body: { razon } }
		);

		return response.data;
	}

	async rechazar(idCaptacion: string, razon?: string): Promise<CaptacionPendiente> {
		const response = await httpClient.post<ApiSuccessResponse<CaptacionPendienteDTO>>(
			`${this.apiBaseUrl}/captaciones/pendientes/${encodeURIComponent(idCaptacion)}/rechazar`,
			{ body: { razon } }
		);

		return response.data;
	}

	async convertir(idCaptacion: string, idAsesor?: string): Promise<CaptacionConvertida> {
		const response = await httpClient.post<ApiSuccessResponse<CaptacionConvertidaDTO>>(
			`${this.apiBaseUrl}/captaciones/pendientes/${encodeURIComponent(idCaptacion)}/convertir`,
			{ body: { idAsesor } }
		);

		return response.data;
	}
}
