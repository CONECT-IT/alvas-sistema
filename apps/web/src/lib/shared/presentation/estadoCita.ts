type BadgeTone = 'brand' | 'success' | 'warning' | 'neutral';

export interface PresentacionCita {
	label: string;
	tone: BadgeTone;
}

const map: Record<string, PresentacionCita> = {
	PENDIENTE: { label: 'Pendiente', tone: 'warning' },
	CONFIRMADA: { label: 'Confirmada', tone: 'brand' },
	REALIZADA: { label: 'Realizada', tone: 'success' },
	CANCELADA: { label: 'Cancelada', tone: 'neutral' },
	REPROGRAMADA: { label: 'Reprogramada', tone: 'brand' }
};

export function presentarEstadoCita(estado: string): PresentacionCita {
	return map[estado.toUpperCase()] ?? { label: estado, tone: 'neutral' };
}

export function opcionesEstadoCita(): { value: string; label: string }[] {
	return Object.entries(map).map(([value, p]) => ({ value, label: p.label }));
}
