type BadgeTone = 'brand' | 'success' | 'warning' | 'neutral';

export interface PresentacionPropiedad {
	label: string;
	tone: BadgeTone;
}

const map: Record<string, PresentacionPropiedad> = {
	BORRADOR: { label: 'Borrador', tone: 'warning' },
	DISPONIBLE: { label: 'Disponible', tone: 'success' },
	RESERVADA: { label: 'Reservada', tone: 'brand' },
	VENDIDA: { label: 'Vendida', tone: 'neutral' },
	ARCHIVADA: { label: 'Archivada', tone: 'neutral' }
};

export function presentarEstadoPropiedad(estado: string): PresentacionPropiedad {
	return map[estado.toUpperCase()] ?? { label: estado, tone: 'neutral' };
}

export const ESTADOS_PROPIEDAD = Object.keys(map);

export function opcionesEstadoPropiedad(): { value: string; label: string }[] {
	return ESTADOS_PROPIEDAD.map((e) => ({ value: e, label: map[e].label }));
}
