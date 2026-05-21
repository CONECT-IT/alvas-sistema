<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import { listarPropiedades } from '$lib/propiedades/application/use-cases/listarPropiedades';
	import { propiedadRepository } from '$lib/propiedades/infrastructure/propiedadRepository';
	import PropiedadAdminTable from '$lib/propiedades/presentation/PropiedadAdminTable.svelte';
	import PropiedadStats from '$lib/propiedades/presentation/PropiedadStats.svelte';

	let propiedades = $state<Propiedad[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function cargarPropiedades() {
		loading = true;
		error = null;

		try {
			propiedades = await listarPropiedades(propiedadRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar propiedades.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		cargarPropiedades();
	});
</script>

<svelte:head>
	<title>Propiedades Disponibles | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Catálogo</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Propiedades disponibles</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Inventario para asesorar clientes y cruzar oportunidades con la cartera de leads.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarPropiedades}>Actualizar catálogo</Button>
	</div>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar propiedades</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarPropiedades}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<PropiedadStats {propiedades} />
		<Card>
			<PropiedadAdminTable {propiedades} />
		</Card>
	{/if}
</div>
