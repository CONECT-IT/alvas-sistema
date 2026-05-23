<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import LeadKanban from '$lib/ventas/presentation/LeadKanban.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';

	let leads = $state<LeadPipeline[]>([]);
	let mostrarConvertidos = $state(false);
	let vista = $state<'tabla' | 'kanban'>('kanban');
	let loading = $state(true);
	let error = $state<string | null>(null);

	let leadsFiltrados = $derived(
		mostrarConvertidos ? leads : leads.filter((l) => l.estado !== 'CONVERTIDO')
	);

	async function cargar() {
		loading = true;
		error = null;

		try {
			leads = await listarPipeline(ventasRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudieron cargar los leads.';
		} finally {
			loading = false;
		}
	}

	function irALead(lead: LeadPipeline) {
		goto(`/admin/leads/${encodeURIComponent(lead.id)}`);
	}

	$effect(() => {
		cargar();
	});
</script>

<svelte:head>
	<title>Leads | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Leads</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Pipeline completo</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Todos los prospectos del sistema, sus estados de avance y citas asociadas.
			</p>
		</div>

		<Button variant="secondary" onclick={cargar}>Actualizar</Button>
	</div>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudieron cargar los leads</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargar}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<PipelineStats leads={leadsFiltrados} />
		<Card>
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Leads registrados</h2>
					<p class="mt-1 text-sm text-text-muted">Todos los prospectos visibles en el sistema.</p>
				</div>
				<div class="flex items-center gap-4">
					<div class="mr-2 flex items-center rounded-xl bg-surface-muted p-1">
						<button
							onclick={() => (vista = 'tabla')}
							class="rounded-lg px-3 py-1 text-xs font-bold transition {vista === 'tabla'
								? 'bg-bg-card text-primary shadow-xs'
								: 'text-text-muted hover:text-text-main'}"
						>
							Lista
						</button>
						<button
							onclick={() => (vista = 'kanban')}
							class="rounded-lg px-3 py-1 text-xs font-bold transition {vista === 'kanban'
								? 'bg-bg-card text-primary shadow-xs'
								: 'text-text-muted hover:text-text-main'}"
						>
							Kanban
						</button>
					</div>
					<label class="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
						<input type="checkbox" bind:checked={mostrarConvertidos} class="accent-primary" />
						Mostrar convertidos
					</label>
					<p class="text-sm font-semibold text-primary">{leadsFiltrados.length} leads</p>
				</div>
			</div>

			{#if vista === 'tabla'}
				<LeadPipelineTable leads={leadsFiltrados} onLeadClick={irALead} onStatusChanged={cargar} />
			{:else}
				<LeadKanban leads={leadsFiltrados} onLeadClick={irALead} onStatusChanged={cargar} />
			{/if}
		</Card>
	{/if}
</div>
