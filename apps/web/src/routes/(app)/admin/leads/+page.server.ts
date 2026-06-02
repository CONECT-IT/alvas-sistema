import type { ServerLoad } from '@sveltejs/kit';

type ApiResp<T> = { success: true; data: T } | { success: false };

type LeadCita = {
	id: string;
	idLead: string;
	idPropiedad?: string;
	fechaInicio: string;
	fechaFin: string;
	estado: string;
	observacion?: string;
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

type UsuarioDto = {
	id: string;
	username: string;
	nombre: string;
	rol: string;
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
	const [leadsRes, propsRes, usersRes, captacionesRes, clientesRes] = await Promise.all([
		fetch('/api/ventas/pipeline').then((r) => r.json<ApiResp<LeadPipeline[]>>()),
		fetch('/api/propiedades').then((r) => r.json<ApiResp<PropiedadDto[]>>()),
		fetch('/api/usuarios').then((r) => r.json<ApiResp<UsuarioDto[]>>()),
		fetch('/api/integraciones/captaciones/pendientes').then((r) => r.json<ApiResp<unknown[]>>()),
		fetch('/api/ventas/clientes').then((r) => r.json<ApiResp<ClienteDto[]>>())
	]);

	return {
		leads: leadsRes.success ? leadsRes.data : [],
		propiedadesDisponibles: propsRes.success
			? propsRes.data.filter((p) => p.estado === 'DISPONIBLE')
			: [],
		asesores: usersRes.success
			? usersRes.data.filter((u) => u.rol === 'ASESOR' && u.estado === 'ACTIVO')
			: [],
		captacionesCount: captacionesRes.success ? captacionesRes.data.length : 0,
		clientes: clientesRes.success ? clientesRes.data : []
	};
};
