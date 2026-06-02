import { httpClient } from '$lib/shared/http/httpClient';
import type { VentasRepository } from '../application/ports/VentasRepository';
import type { ActualizarCitaInput } from '../application/use-cases/actualizarCita';
import type { ActualizarLeadInput } from '../application/use-cases/actualizarLead';
import type { AgendarCitaInput } from '../application/use-cases/agendarCita';
import type { ConvertirLeadInput } from '../application/use-cases/convertirLead';
import type { CrearContratoInput } from '../application/use-cases/crearContrato';
import type { RegistrarLeadInput } from '../application/use-cases/registrarLead';
import type { LeadDetalle } from '../domain/models/LeadDetalle';
import type { LeadPipeline } from '../domain/models/LeadPipeline';
import { mapLeadPipelineFromDto } from './VentasMapper';
import type {
	ActividadLeadDTO,
	ActualizarCitaRequestDTO,
	ActualizarLeadRequestDTO,
	AgendarCitaRequestDTO,
	ApiSuccessResponse,
	ContratoDTO,
	ConvertirLeadRequestDTO,
	ConvertirLeadResponseDTO,
	CrearContratoRequestDTO,
	LeadDetalleDTO,
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

	async obtenerLead(id: string): Promise<LeadDetalle> {
		const response = await httpClient.get<ApiSuccessResponse<LeadDetalleDTO>>(
			`${this.apiBaseUrl}/ventas/lead/${encodeURIComponent(id)}`
		);
		return response.data;
	}

	async registrarLead(input: RegistrarLeadInput): Promise<string> {
		const body: RegistrarLeadRequestDTO = {
			nombre: input.nombre,
			email: input.email,
			telefono: input.telefono,
			tipo: input.tipo,
			idAsesor: input.idAsesor || undefined,
			idCliente: input.idCliente || undefined,
			idPropiedadInteres: input.idPropiedadInteres || undefined,
			datosPropiedad: input.datosPropiedad || undefined
		};
		const response = await httpClient.post<ApiSuccessResponse<RegistrarLeadResponseDTO>>(
			`${this.apiBaseUrl}/ventas/lead`,
			{ body }
		);

		return response.data.id;
	}

	async actualizarLead(input: ActualizarLeadInput): Promise<void> {
		const body: ActualizarLeadRequestDTO = {
			nombre: input.nombre || undefined,
			email: input.email || undefined,
			telefono: input.telefono || undefined,
			tipo: input.tipo,
			idPropiedadInteres: input.idPropiedadInteres || undefined,
			estado: input.estado || undefined
		};

		await httpClient.put<ApiSuccessResponse<{ message?: string }>>(
			`${this.apiBaseUrl}/ventas/lead/${encodeURIComponent(input.idLead)}`,
			{ body }
		);
	}

	async convertirLead(input: ConvertirLeadInput): Promise<string> {
		const body: ConvertirLeadRequestDTO = {
			idLead: input.idLead
		};
		const response = await httpClient.post<ApiSuccessResponse<ConvertirLeadResponseDTO>>(
			`${this.apiBaseUrl}/ventas/convertir`,
			{ body }
		);

		return response.data.idCliente;
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

	async actualizarCita(input: ActualizarCitaInput): Promise<void> {
		const body: ActualizarCitaRequestDTO = {
			fechaInicio: input.fechaInicio,
			duracionMinutos: input.duracionMinutos,
			observacion: input.observacion,
			estado: input.estado
		};

		await httpClient.put<ApiSuccessResponse<{ message?: string }>>(
			`${this.apiBaseUrl}/ventas/lead/${encodeURIComponent(input.idLead)}/cita/${encodeURIComponent(input.idCita)}`,
			{ body }
		);
	}

	async listarActividadLead(idLead: string): Promise<ActividadLeadDTO[]> {
		const response = await httpClient.get<ApiSuccessResponse<ActividadLeadDTO[]>>(
			`${this.apiBaseUrl}/ventas/lead/${encodeURIComponent(idLead)}/actividad`
		);

		return response.data;
	}

	async crearContrato(input: CrearContratoInput): Promise<ContratoDTO> {
		const body: CrearContratoRequestDTO = {
			idLead: input.idLead,
			idPropiedad: input.idPropiedad,
			fechaInicio: input.fechaInicio,
			fechaFin: input.fechaFin
		};

		const response = await httpClient.post<ApiSuccessResponse<ContratoDTO>>(
			`${this.apiBaseUrl}/ventas/contratos`,
			{ body }
		);

		return response.data;
	}

	async cancelarContrato(idContrato: string): Promise<void> {
		await httpClient.post<ApiSuccessResponse<{ message?: string }>>(
			`${this.apiBaseUrl}/ventas/contratos/${encodeURIComponent(idContrato)}/cancelar`,
			{}
		);
	}

	async firmarContrato(idContrato: string): Promise<void> {
		await httpClient.post<ApiSuccessResponse<{ message?: string }>>(
			`${this.apiBaseUrl}/ventas/contratos/${encodeURIComponent(idContrato)}/firmar`,
			{}
		);
	}

	async listarContratos(): Promise<ContratoDTO[]> {
		const response = await httpClient.get<ApiSuccessResponse<{ contratos: ContratoDTO[] }>>(
			`${this.apiBaseUrl}/ventas/contratos/mios`
		);

		return response.data.contratos;
	}

	async listarPropiedadesPorCliente(idLead: string): Promise<string[]> {
		const response = await httpClient.get<ApiSuccessResponse<{ id: string }[]>>(
			`${this.apiBaseUrl}/propiedades?leadId=${encodeURIComponent(idLead)}`
		);

		return response.data.map((propiedad) => propiedad.id);
	}
}
