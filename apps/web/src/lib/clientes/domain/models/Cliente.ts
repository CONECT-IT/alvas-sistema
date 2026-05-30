export type Cliente = Readonly<{
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	idAsesor: string;
	nombreAsesor?: string;
	idLeadOrigen?: string;
	nombreLead?: string;
	creadoEn: string;
	actualizadoEn: string;
}>;
