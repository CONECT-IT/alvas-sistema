import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type LeadCita = {
	id: string;
	idLead: string;
	idPropiedad?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
};

type LeadPipeline = {
	id: string;
	nombre: string;
	estado: string;
	tipo: string;
	idAsesor?: string;
	nombreAsesor?: string;
	citasCount: number;
	citas: LeadCita[];
};

type PropiedadDto = {
	id: string;
	titulo: string;
	precio: number;
	estado: string;
};

type ClienteDto = {
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
};

export const load: ServerLoad = async ({ fetch }) => {
	const [pipelineRes, propiedadesRes, clientesRes] = await Promise.all([
		fetch('/api/ventas/pipeline').then((r) => r.json<ApiResp<LeadPipeline[]>>()),
		fetch('/api/propiedades').then((r) => r.json<ApiResp<PropiedadDto[]>>()),
		fetch('/api/ventas/clientes').then((r) => r.json<ApiResp<ClienteDto[]>>())
	]);

	return {
		leads: pipelineRes.success ? pipelineRes.data : [],
		propiedadesDisponibles: propiedadesRes.success
			? propiedadesRes.data.filter((p) => p.estado.toUpperCase() === 'DISPONIBLE')
			: [],
		clientes: clientesRes.success ? clientesRes.data : []
	};
};
