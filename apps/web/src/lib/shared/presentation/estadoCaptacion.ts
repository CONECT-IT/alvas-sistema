type BadgeTone = 'brand' | 'success' | 'warning' | 'neutral';

export interface PresentacionCaptacion {
	label: string;
	tone: BadgeTone;
}

const map: Record<string, PresentacionCaptacion> = {
	PENDIENTE: { label: 'Pendiente', tone: 'warning' },
	REVISADA: { label: 'Revisada', tone: 'brand' },
	CONVERTIDA: { label: 'Convertida', tone: 'success' },
	DESCARTADA: { label: 'Descartada', tone: 'neutral' }
};

export function presentarEstadoCaptacion(estado: string): PresentacionCaptacion {
	return map[estado.toUpperCase()] ?? { label: estado, tone: 'neutral' };
}
