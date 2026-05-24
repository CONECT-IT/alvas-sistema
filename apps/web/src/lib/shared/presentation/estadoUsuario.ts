type BadgeTone = 'brand' | 'success' | 'warning' | 'neutral';

export interface PresentacionUsuario {
	label: string;
	tone: BadgeTone;
}

const map: Record<string, PresentacionUsuario> = {
	ACTIVO: { label: 'Activo', tone: 'success' },
	INACTIVO: { label: 'Inactivo', tone: 'neutral' },
	SUSPENDIDO: { label: 'Suspendido', tone: 'neutral' },
	DESHABILITADO: { label: 'Deshabilitado', tone: 'neutral' }
};

export function presentarEstadoUsuario(estado: string): PresentacionUsuario {
	return map[estado.toUpperCase()] ?? { label: estado, tone: 'neutral' };
}
