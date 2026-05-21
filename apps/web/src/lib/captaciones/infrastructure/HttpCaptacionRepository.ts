import { httpClient } from '$lib/shared/http/httpClient';
import type { CaptacionRepository } from '../application/ports/CaptacionRepository';
import type { CaptacionVendedor } from '../domain/models/CaptacionVendedor';
import type {
	ApiSuccessResponse,
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
}
