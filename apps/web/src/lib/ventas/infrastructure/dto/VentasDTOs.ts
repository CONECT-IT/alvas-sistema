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
	idAsesor?: string;
	nombreAsesor?: string;
	citasCount: number;
	citas?: CitaPipelineDTO[];
}>;

export type RegistrarLeadRequestDTO = Readonly<{
	nombre: string;
	email: string;
	telefono: string;
	tipo: 'COMPRA' | 'VENTA';
	idPropiedadInteres?: string;
	datosPropiedad?: {
		titulo: string;
		descripcion: string;
		precio: number;
	};
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

export type ActividadLeadDTO = Readonly<{
	id: number;
	evento: string;
	descripcion: string;
	fecha: string;
}>;

export type ContratoDTO = Readonly<{
	id: string;
	idLead?: string;
	nombreLead?: string;
	idCliente?: string;
	idPropiedad: string;
	nombrePropiedad?: string;
	idAsesor?: string;
	nombreAsesor?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
	creadoEn: string;
	actualizadoEn: string;
}>;

export type CrearContratoRequestDTO = Readonly<{
	idLead: string;
	idPropiedad: string;
	fechaInicio: string;
	fechaFin: string;
}>;

export type LeadDetalleDTO = Readonly<{
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	tipo: string;
	estado: string;
	idAsesor: string;
	nombreAsesor?: string;
	idCliente: string | null;
	idPropiedadInteres: string | null;
	citas: CitaPipelineDTO[];
	creadoEn: string;
	actualizadoEn: string;
}>;
