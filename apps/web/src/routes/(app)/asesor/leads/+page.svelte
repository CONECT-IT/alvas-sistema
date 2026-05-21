<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';

	let leads = $state<LeadPipeline[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function cargarLeads() {
		loading = true;
		error = null;

		try {
			leads = await listarPipeline(ventasRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar tus leads.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		cargarLeads();
	});
</script>

<svelte:head>
	<title>Mis Leads | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Cartera</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Mis leads</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Prospectos asignados a tu usuario, con estado actual y citas registradas para seguimiento.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarLeads}>Actualizar leads</Button>
	</div>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar la cartera</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarLeads}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<PipelineStats {leads} />
		<Card>
			<LeadPipelineTable {leads} />
		</Card>
	{/if}
</div>
