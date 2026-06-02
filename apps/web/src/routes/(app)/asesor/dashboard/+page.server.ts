import type { ServerLoad } from '@sveltejs/kit';
import { leerApi } from '$lib/shared/server/leerApi';

type LeadCita = {
	id: string;
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
	citasCount: number;
	citas?: LeadCita[];
};

type PropiedadDto = {
	id: string;
	titulo: string;
	precio: number;
	estado: string;
};

export const load: ServerLoad = async ({ fetch }) => {
	const [pipelineRes, propiedadesRes] = await Promise.all([
		fetch('/api/ventas/pipeline').then((r) => leerApi<LeadPipeline[]>(r, [])),
		fetch('/api/propiedades').then((r) => leerApi<PropiedadDto[]>(r, []))
	]);

	const leads: LeadPipeline[] = pipelineRes.success ? pipelineRes.data : [];
	const propiedades: PropiedadDto[] = propiedadesRes.success ? propiedadesRes.data : [];

	const leadsActivos = leads.length;
	const hoy = new Date();
	hoy.setHours(0, 0, 0, 0);
	const manana = new Date(hoy);
	manana.setDate(manana.getDate() + 1);

	const citasHoy =
		leads
			?.flatMap((l) => (l.citas ?? []).map((c) => ({ ...c, leadNombre: l.nombre })))
			.filter((c) => {
				const inicio = new Date(c.fechaInicio);
				return inicio >= hoy && inicio < manana;
			})
			.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()) ?? [];

	const citasPendientes =
		leads?.flatMap((l) => (l.citas ?? []).filter((c) => c.estado === 'PENDIENTE')).length ?? 0;

	const portafolio = propiedades.filter(
		(p) => p.estado === 'DISPONIBLE' || p.estado === 'RESERVADA'
	).length;

	return {
		leadsActivos,
		citasPendientes,
		citasHoy,
		portafolio
	};
};
