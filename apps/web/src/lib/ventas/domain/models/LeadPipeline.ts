export type CitaPipeline = Readonly<{
	id: string;
	idLead: string;
	idPropiedad?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
	observacion?: string;
}>;

export type LeadPipeline = Readonly<{
	id: string;
	nombre: string;
	estado: string;
	tipo: string;
	citasCount: number;
	citas: CitaPipeline[];
}>;
