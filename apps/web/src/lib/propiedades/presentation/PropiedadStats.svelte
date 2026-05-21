<script lang="ts">
	import Card from '$lib/shared/ui/Card.svelte';
	import type { Propiedad } from '../domain/models/Propiedad';

	interface Props {
		propiedades: Propiedad[];
	}

	let { propiedades }: Props = $props();

	const disponibles = $derived(
		propiedades.filter((propiedad) => propiedad.estado.toUpperCase() === 'DISPONIBLE').length
	);
	const reservadas = $derived(
		propiedades.filter((propiedad) => propiedad.estado.toUpperCase() === 'RESERVADA').length
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
		<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Inventario</p>
		<p class="mt-2 font-display text-3xl font-bold text-text-main">{propiedades.length}</p>
		<p class="mt-2 text-xs text-text-muted">Propiedades registradas</p>
	</Card>

	<Card>
		<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Disponibles</p>
		<p class="mt-2 font-display text-3xl font-bold text-text-main">{disponibles}</p>
		<p class="mt-2 text-xs text-text-muted">{reservadas} con separación o reserva</p>
	</Card>

	<Card>
		<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Valor listado</p>
		<p class="mt-2 font-display text-3xl font-bold text-text-main">
			{currencyFormatter.format(valorInventario)}
		</p>
		<p class="mt-2 text-xs text-text-muted">Suma referencial del catálogo</p>
	</Card>
</div>
