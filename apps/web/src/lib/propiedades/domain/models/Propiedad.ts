export type EstadoPropiedad =
	| 'BORRADOR'
	| 'DISPONIBLE'
	| 'RESERVADA'
	| 'VENDIDA'
	| 'ARCHIVADA'
	| string;

export type OrigenPropiedad = 'MANUAL' | 'CAPTACION' | string;

export type Propiedad = Readonly<{
	id: string;
	titulo: string;
	descripcion: string;
	precio: number;
	origen: OrigenPropiedad;
	estado: EstadoPropiedad;
	idLeadOrigen?: string;
	idClientePropietario?: string;
	captadaPorAsesorId?: string;
	asesorResponsableId?: string;
}>;
