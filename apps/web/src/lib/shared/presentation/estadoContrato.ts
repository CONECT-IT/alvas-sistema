type BadgeTone = 'brand' | 'success' | 'warning' | 'neutral';

export interface PresentacionContrato {
	label: string;
	tone: BadgeTone;
}

const map: Record<string, PresentacionContrato> = {
	BORRADOR: { label: 'Borrador', tone: 'warning' },
	VIGENTE: { label: 'Vigente', tone: 'success' },
	ACTIVO: { label: 'Activo', tone: 'success' },
	FINALIZADO: { label: 'Finalizado', tone: 'neutral' },
	CANCELADO: { label: 'Cancelado', tone: 'neutral' },
	RESCINDIDO: { label: 'Rescindido', tone: 'neutral' },
	FIRMADO: { label: 'Firmado', tone: 'brand' }
};

export function presentarEstadoContrato(estado: string): PresentacionContrato {
	return map[estado.toUpperCase()] ?? { label: estado, tone: 'neutral' };
}
