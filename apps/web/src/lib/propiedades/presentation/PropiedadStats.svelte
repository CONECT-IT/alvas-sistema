<script lang="ts">
	import Card from '$lib/shared/ui/Card.svelte';
	import { presentarEstadoPropiedad } from '$lib/shared/presentation';
	import type { Propiedad } from '../domain/models/Propiedad';

	interface Props {
		propiedades: Propiedad[];
	}

	let { propiedades }: Props = $props();

	const disponibles = $derived(
		propiedades.filter((propiedad) => presentarEstadoPropiedad(propiedad.estado).tone === 'success').length
	);
	const reservadas = $derived(
		propiedades.filter((propiedad) => presentarEstadoPropiedad(propiedad.estado).tone === 'brand').length
	);
	const valorInventario = $derived(
		propiedades.reduce((total, propiedad) => total + propiedad.precio, 0)
	);

	const currencyFormatter = new Intl.NumberFormat('es-PE', {
		style: 'currency',
		currency: 'PEN',
		maximumFractionDigits: 0
	});
</script>

<div class="grid gap-4 md:grid-cols-3">
	<Card>
		<p class="stat-label">Inventario</p>
		<p class="page-heading">{propiedades.length}</p>
		<p class="mt-2 text-xs text-text-muted">Propiedades registradas</p>
	</Card>

	<Card>
		<p class="stat-label">Disponibles</p>
		<p class="page-heading">{disponibles}</p>
		<p class="mt-2 text-xs text-text-muted">{reservadas} con separación o reserva</p>
	</Card>

	<Card>
		<p class="stat-label">Valor listado</p>
		<p class="page-heading">
			{currencyFormatter.format(valorInventario)}
		</p>
		<p class="mt-2 text-xs text-text-muted">Suma referencial del catálogo</p>
	</Card>
</div>
