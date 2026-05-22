export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type CitaPipelineDTO = Readonly<{
	id: string;
	idLead: string;
	idPropiedad?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
	observacion?: string;
}>;

export type LeadPipelineDTO = Readonly<{
	id: string;
	nombre: string;
	estado: string;
	tipo: string;
	citasCount: number;
	citas?: CitaPipelineDTO[];
}>;

export type RegistrarLeadRequestDTO = Readonly<{
	nombre: string;
	email: string;
	telefono: string;
	tipo: 'COMPRA' | 'VENTA';
	idPropiedadInteres?: string;
}>;

export type RegistrarLeadResponseDTO = Readonly<{
	id: string;
}>;

export type AgendarCitaRequestDTO = Readonly<{
	idLead: string;
	idPropiedad?: string;
	fechaInicio: string;
	duracionMinutos: number;
	observacion?: string;
}>;

export type ActualizarLeadRequestDTO = Readonly<{
	nombre?: string;
	email?: string;
	telefono?: string;
	tipo?: 'COMPRA' | 'VENTA';
	idPropiedadInteres?: string;
}>;

export type ConvertirLeadRequestDTO = Readonly<{
	idLead: string;
}>;

export type ConvertirLeadResponseDTO = Readonly<{
	idCliente: string;
}>;

export type ActualizarCitaRequestDTO = Readonly<{
	fechaInicio?: string;
	duracionMinutos?: number;
	observacion?: string;
	estado?: 'PENDIENTE' | 'REALIZADA' | 'CANCELADA' | 'REPROGRAMADA';
}>;
