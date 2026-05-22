import type { CitaPipeline } from './LeadPipeline';

export type LeadDetalle = Readonly<{
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	tipo: string;
	estado: string;
	idAsesor: string;
	idCliente: string | null;
	idPropiedadInteres: string | null;
	citas: CitaPipeline[];
	creadoEn: string;
	actualizadoEn: string;
}>;
