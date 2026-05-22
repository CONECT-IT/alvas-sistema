export type Cliente = Readonly<{
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	idAsesor: string;
	idLeadOrigen?: string;
	creadoEn: string;
	actualizadoEn: string;
}>;
