<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let leads = $derived((data?.leads as unknown as LeadPipeline[]) ?? []);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function cargarPipeline() {
		loading = true;
		error = null;

		try {
			await invalidateAll();
		} catch {
			error = 'No se pudo actualizar la cartera comercial.';
		} finally {
			loading = false;
		}
	}

	function verDetalle(lead: LeadPipeline) {
		goto(`/admin/leads/${lead.id}`);
	}
</script>

<svelte:head>
	<title>Ventas y CRM | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">CRM</p>
			<h1 class="page-heading">Cartera comercial</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Revisa los prospectos visibles para la sesión, sus estados de avance y la cantidad de citas
				asociadas.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarPipeline}>Actualizar cartera</Button>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
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
