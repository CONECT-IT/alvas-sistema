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

export type EstadoCaptacionDTO =
	| 'PENDIENTE'
	| 'REVISADA'
	| 'DUPLICADA'
	| 'CONVERTIDA'
	| 'RECHAZADA';

export type CaptacionPendienteDTO = Readonly<{
	id: string;
	canal: string;
	origen: string;
	nombre: string;
	telefono: string;
	email: string;
	tipo: string;
	estado: EstadoCaptacionDTO;
	idPropiedadInteres?: string;
	metadata?: Readonly<Record<string, string>>;
	razonDuplicado?: string;
	creadoEn: string;
	actualizadoEn: string;
}>;

export type CaptacionConvertidaDTO = CaptacionProcesadaDTO &
	Readonly<{
		captacion: CaptacionPendienteDTO;
	}>;
