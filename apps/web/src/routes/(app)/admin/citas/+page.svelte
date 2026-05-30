<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { presentarEstadoCita } from '$lib/shared/presentation';
	import type { PageData } from './$types';

	type CitaAgenda = {
		id: string;
		idLead: string;
		idPropiedad?: string;
		nombrePropiedad?: string;
		idAsesor: string;
		nombreAsesor?: string;
		fechaInicio: string;
		fechaFin: string;
		estado: string;
		observacion?: string;
		nombreLead?: string;
	};

	let { data }: { data: PageData } = $props();

	let citas = $derived((data?.citas as unknown as CitaAgenda[]) ?? []);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function cargar() {
		loading = true;
		error = null;

		try {
			await invalidateAll();
		} catch {
			error = 'No se pudieron actualizar las citas.';
		} finally {
			loading = false;
		}
	}

	function formatearFecha(fechaIso: string): string {
		return new Intl.DateTimeFormat('es-PE', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(fechaIso));
	}

	function verLead(idLead: string) {
		goto(`/admin/leads/${encodeURIComponent(idLead)}`);
	}
</script>

<svelte:head>
	<title>Citas | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Citas</p>
			<h1 class="page-heading">Todas las citas</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Citas registradas en el sistema por todos los asesores.
			</p>
		</div>

		<Button variant="secondary" onclick={cargar}>Actualizar</Button>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudieron cargar las citas</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargar}>Intentar nuevamente</Button>
		</Card>
	{:else if citas.length === 0}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No hay citas registradas</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">
				Cuando los asesores agenden citas, aparecerán en esta vista.
			</p>
		</Card>
	{:else}
		<Card>
			<div class="mb-5">
				<h2 class="font-display text-xl font-bold text-text-main">Agenda del sistema</h2>
				<p class="mt-1 text-sm text-text-muted">
					{citas.length} cita{citas.length !== 1 ? 's' : ''}
				</p>
			</div>

			<div class="grid gap-3">
				{#each citas as cita (cita.id)}
					<button
						onclick={() => verLead(cita.idLead)}
						class="grid w-full gap-3 rounded-2xl border border-border-light bg-bg-card px-4 py-3 text-left transition hover:border-primary/30 hover:shadow-md md:grid-cols-[1fr_0.8fr_0.8fr_auto]"
					>
						<div>
							<p class="font-semibold text-text-main">{cita.nombreLead ?? 'Prospecto'}</p>
							<p class="mt-1 text-xs font-medium text-text-muted">Prospecto en agenda</p>
						</div>
						<div>
							<p class="text-sm font-semibold text-text-main">Asesor</p>
							<p class="mt-1 text-xs text-text-muted">{cita.nombreAsesor ?? 'Asesor asignado'}</p>
						</div>
						<div>
							<p class="text-sm font-semibold text-text-main">{formatearFecha(cita.fechaInicio)}</p>
							<p class="mt-1 text-xs text-text-muted">
								{cita.observacion ?? cita.nombrePropiedad ?? 'Sin observación'}
							</p>
						</div>
						<div class="flex items-center">
							<Badge tone={presentarEstadoCita(cita.estado).tone}>
								{presentarEstadoCita(cita.estado).label}
							</Badge>
						</div>
					</button>
				{/each}
			</div>
		</Card>
	{/if}
</div>
