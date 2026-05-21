export type ApiSuccessResponse<T> = Readonly<{
	success: true;
	data: T;
}>;

export type CaptacionVendedorRequestDTO = Readonly<{
	canal: 'FORMULARIO_WEB';
	origen: string;
	nombre: string;
	telefono: string;
	email?: string;
	tipo: 'VENTA';
	metadata: Readonly<Record<string, string>>;
}>;

export type CaptacionProcesadaDTO = Readonly<{
	idLead: string;
	idPropiedadPreliminar?: string;
}>;
