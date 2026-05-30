<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import PropiedadAdminTable from '$lib/propiedades/presentation/PropiedadAdminTable.svelte';
	import PropiedadStats from '$lib/propiedades/presentation/PropiedadStats.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let propiedades = $derived((data?.propiedades as unknown as Propiedad[]) ?? []);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let mostrarSoloPublicadas = $state(false);

	const captaciones = $derived(propiedades.filter((p) => p.estado.toUpperCase() === 'BORRADOR'));
	const disponibles = $derived(propiedades.filter((p) => p.estado.toUpperCase() === 'DISPONIBLE'));
	const otras = $derived(
		propiedades.filter((p) => !['BORRADOR', 'DISPONIBLE'].includes(p.estado.toUpperCase()))
	);

	async function cargarPropiedades() {
		loading = true;
		error = null;

		try {
			await invalidateAll();
		} catch {
			error = 'No se pudieron actualizar las propiedades.';
		} finally {
			loading = false;
		}
	}

	function irAPropiedad(p: Propiedad) {
		goto(`/asesor/propiedades/${encodeURIComponent(p.id)}`);
	}
</script>

<svelte:head>
	<title>Inventario de Propiedades | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Inventario</p>
			<h1 class="page-heading">Gestión de propiedades</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Inventario disponible y propiedades en borrador captadas para seguimiento.
			</p>
		</div>

		<div class="flex items-center gap-4">
			<label class="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
				<input
					type="checkbox"
					bind:checked={mostrarSoloPublicadas}
					class="h-4 w-4 rounded border-border-light text-primary accent-primary"
				/>
				Solo publicadas
			</label>
			<Button variant="secondary" onclick={cargarPropiedades}>Actualizar inventario</Button>
		</div>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar propiedades</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarPropiedades}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<PropiedadStats {propiedades} />

		{#if !mostrarSoloPublicadas && captaciones.length > 0}
			<Card>
				<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
					<div>
						<h2 class="font-display text-xl font-bold text-text-main">Captaciones</h2>
						<p class="mt-1 text-sm text-text-muted">
							Tus propiedades en borrador captadas que requieren validación.
						</p>
					</div>
					<p class="text-sm font-semibold text-primary">{captaciones.length} registros</p>
				</div>
				<PropiedadAdminTable propiedades={captaciones} onPropiedadClick={irAPropiedad} />
			</Card>
		{/if}

		{#if disponibles.length > 0}
			<Card>
				<div class="mb-5">
					<h2 class="font-display text-xl font-bold text-text-main">Disponibles</h2>
					<p class="mt-1 text-sm text-text-muted">
						Propiedades listas para comercialización en el sistema.
					</p>
				</div>
				<PropiedadAdminTable propiedades={disponibles} onPropiedadClick={irAPropiedad} />
			</Card>
		{/if}

		{#if !mostrarSoloPublicadas && otras.length > 0}
			<Card>
				<div class="mb-5">
					<h2 class="font-display text-xl font-bold text-text-main">Otras propiedades</h2>
					<p class="mt-1 text-sm text-text-muted">
						Propiedades en validación, reservadas o ya vendidas.
					</p>
				</div>
				<PropiedadAdminTable propiedades={otras} onPropiedadClick={irAPropiedad} />
			</Card>
		{/if}
	{/if}
</div>
