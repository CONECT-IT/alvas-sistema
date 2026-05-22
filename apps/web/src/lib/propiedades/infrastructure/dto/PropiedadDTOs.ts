export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type CrearPropiedadRequestDTO = Readonly<{
	titulo: string;
	descripcion: string;
	precio: number;
	origen: 'ALVAS';
	estado: string;
	asesorResponsableId?: string;
}>;

export type CrearPropiedadResponseDTO = Readonly<{
	id: string;
}>;

export type ActualizarPropiedadRequestDTO = Readonly<{
	titulo?: string;
	descripcion?: string;
	precio?: number;
	estado?: string;
	asesorResponsableId?: string;
}>;

export type PropiedadRespuestaDTO = Readonly<{
	id: string;
	titulo: string;
	descripcion: string;
	precio: number;
	origen: string;
	estado: string;
	idLeadOrigen?: string;
	idClientePropietario?: string;
	captadaPorAsesorId?: string;
	asesorResponsableId?: string;
}>;
