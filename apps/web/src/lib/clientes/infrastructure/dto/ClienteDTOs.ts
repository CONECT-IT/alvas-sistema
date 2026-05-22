export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type ClienteDTO = Readonly<{
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	idAsesor: string;
	idLeadOrigen?: string;
	creadoEn: string;
	actualizadoEn: string;
}>;

export type RegistrarClienteRequestDTO = Readonly<{
	nombre: string;
	email: string;
	telefono: string;
}>;

export type RegistrarClienteResponseDTO = Readonly<{
	id: string;
}>;

export type ActualizarClienteRequestDTO = Readonly<{
	nombre?: string;
	email?: string;
	telefono?: string;
}>;

export type ClienteOutputDTO = ClienteDTO;
