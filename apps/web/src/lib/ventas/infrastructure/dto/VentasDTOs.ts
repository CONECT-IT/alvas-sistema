export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type LeadPipelineDTO = Readonly<{
	id: string;
	nombre: string;
	estado: string;
	tipo: string;
	citasCount: number;
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
