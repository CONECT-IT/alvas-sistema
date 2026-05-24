type BadgeTone = 'brand' | 'success' | 'warning' | 'neutral';

export interface PresentacionLead {
	label: string;
	tone: BadgeTone;
}

const map: Record<string, PresentacionLead> = {
	NUEVO: { label: 'Nuevo', tone: 'warning' },
	CONTACTO: { label: 'Contacto', tone: 'brand' },
	SEGUIMIENTO: { label: 'Seguimiento', tone: 'brand' },
	CALIFICANDO: { label: 'Calificando', tone: 'brand' },
	AGENDADO: { label: 'Agendado', tone: 'brand' },
	TRABAJANDO: { label: 'Trabajando', tone: 'brand' },
	NEGOCIACION: { label: 'Negociación', tone: 'brand' },
	CONVERTIDO: { label: 'Convertido', tone: 'success' },
	PERDIDO: { label: 'Perdido', tone: 'neutral' }
};

export function presentarEstadoLead(estado: string): PresentacionLead {
	return map[estado.toUpperCase()] ?? { label: estado, tone: 'neutral' };
}

export const ESTADOS_LEAD = Object.keys(map);

export function opcionesEstadoLead(): { value: string; label: string }[] {
	return ESTADOS_LEAD.map((e) => ({ value: e, label: map[e].label }));
}
