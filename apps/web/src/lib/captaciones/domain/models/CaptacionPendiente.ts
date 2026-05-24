export type EstadoCaptacion = 'PENDIENTE' | 'REVISADA' | 'DUPLICADA' | 'CONVERTIDA' | 'RECHAZADA';

export type CaptacionPendiente = Readonly<{
	id: string;
	canal: string;
	origen: string;
	nombre: string;
	telefono: string;
	email: string;
	tipo: string;
	estado: EstadoCaptacion;
	idPropiedadInteres?: string;
	metadata?: Readonly<Record<string, string>>;
	razonDuplicado?: string;
	creadoEn: string;
	actualizadoEn: string;
}>;

export type CaptacionConvertida = Readonly<{
	idLead: string;
	idPropiedadPreliminar?: string;
	captacion: CaptacionPendiente;
}>;
