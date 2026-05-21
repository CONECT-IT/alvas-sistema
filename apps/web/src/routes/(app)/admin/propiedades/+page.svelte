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
	const skeletonCards = [1, 2, 3];

	async function cargarPropiedades() {
		loading = true;
		error = null;

		try {
			propiedades = await listarPropiedades(propiedadRepository);
		} catch (err) {
			if (err instanceof HttpError) {
				error = err.message;
			} else {
				error = 'No se pudo cargar el catálogo de propiedades.';
			}
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		cargarPropiedades();
	});
</script>

<svelte:head>
	<title>Catálogo de Propiedades | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Administración</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Catálogo de propiedades</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Consulta el inventario registrado, revisa disponibilidad y detecta propiedades sin asesor
				responsable.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarPropiedades} class="md:self-end">
			Actualizar listado
		</Button>
	</div>

	{#if loading}
		<div class="grid gap-4 md:grid-cols-3">
			{#each skeletonCards as skeleton (skeleton)}
				<Card>
					<div class="h-4 w-24 animate-pulse rounded bg-surface-muted"></div>
					<div class="mt-4 h-8 w-16 animate-pulse rounded bg-primary-light"></div>
					<div class="mt-3 h-3 w-32 animate-pulse rounded bg-surface-muted"></div>
				</Card>
			{/each}
		</div>
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar el catálogo</p>
			<p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarPropiedades}>Intentar nuevamente</Button>
		</Card>
	{:else if propiedades.length === 0}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">
				Aún no hay propiedades registradas
			</p>
			<p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
				Cuando el equipo registre propiedades desde el CRM o por captación, aparecerán aquí para
				control comercial.
			</p>
		</Card>
	{:else}
		<PropiedadStats {propiedades} />
		<Card>
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Inventario registrado</h2>
					<p class="mt-1 text-sm text-text-muted">
						Datos cargados directamente desde la API de propiedades.
					</p>
				</div>
				<p class="text-sm font-semibold text-primary">{propiedades.length} registros</p>
			</div>

			<PropiedadAdminTable {propiedades} />
		</Card>
	{/if}
</div>
