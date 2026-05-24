type BadgeTone = 'brand' | 'success' | 'warning' | 'neutral';

export interface PresentacionTipoVenta {
	label: string;
	tone: BadgeTone;
}

const map: Record<string, PresentacionTipoVenta> = {
	COMPRA: { label: 'Comprador', tone: 'brand' },
	VENTA: { label: 'Vendedor', tone: 'success' }
};

export function presentarTipoVenta(tipo: string): PresentacionTipoVenta {
	return map[tipo.toUpperCase()] ?? { label: tipo, tone: 'neutral' };
}

export function opcionesTipoVenta(): { value: string; label: string }[] {
	return Object.entries(map).map(([value, p]) => ({ value, label: p.label }));
}
