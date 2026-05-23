<script lang="ts">
	import { goto } from '$app/navigation';
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

	async function cargarPipeline() {
		loading = true;
		error = null;

		try {
			leads = await listarPipeline(ventasRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar la cartera comercial.';
		} finally {
			loading = false;
		}
	}

	function verDetalle(lead: LeadPipeline) {
		goto(`/admin/leads/${lead.id}`);
	}

	$effect(() => {
		cargarPipeline();
	});
</script>

<svelte:head>
	<title>Ventas y CRM | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">CRM</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Cartera comercial</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Revisa los prospectos visibles para la sesión, sus estados de avance y la cantidad de citas
				asociadas.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarPipeline}>Actualizar cartera</Button>
	</div>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar ventas</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarPipeline}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<PipelineStats {leads} />
		<Card>
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Leads registrados</h2>
					<p class="mt-1 text-sm text-text-muted">Datos cargados desde ventas/pipeline.</p>
				</div>
				<p class="text-sm font-semibold text-primary">{leads.length} leads</p>
			</div>

			<LeadPipelineTable {leads} onLeadClick={verDetalle} />
		</Card>
	{/if}
</div>
