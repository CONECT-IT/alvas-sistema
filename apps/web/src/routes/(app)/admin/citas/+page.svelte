<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { httpClient, HttpError } from '$lib/shared/http/httpClient';

	type CitaAgenda = {
		idLead: string;
		idPropiedad?: string;
		idAsesor: string;
		fechaInicio: string;
		fechaFin: string;
		estado: string;
		observacion?: string;
		leadNombre: string;
	};

	let citas = $state<CitaAgenda[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function cargar() {
		loading = true;
		error = null;

		try {
			const res = await httpClient.get<{ success: boolean; data: CitaAgenda[] }>(
				'/api/ventas/citas'
			);
			citas = res.data;
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudieron cargar las citas.';
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

	function estadoBadge(estado: string): string {
		const map: Record<string, string> = {
			PENDIENTE: 'bg-amber-50 text-amber-700',
			REALIZADA: 'bg-emerald-50 text-emerald-700',
			CANCELADA: 'bg-red-50 text-red-700',
			REPROGRAMADA: 'bg-blue-50 text-blue-700'
		};
		return map[estado] ?? 'bg-gray-50 text-gray-700';
	}

	$effect(() => {
		cargar();
	});
</script>

<svelte:head>
	<title>Citas | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Citas</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Todas las citas</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Citas registradas en el sistema por todos los asesores.
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
				{#each citas as cita (cita.idLead + cita.fechaInicio)}
					<div
						class="grid gap-3 rounded-2xl border border-border-light bg-white px-4 py-3 md:grid-cols-[1fr_0.8fr_0.8fr_auto]"
					>
						<div>
							<p class="font-semibold text-text-main">{cita.leadNombre}</p>
							<p class="mt-1 text-xs font-medium text-text-muted">Lead: {cita.idLead}</p>
						</div>
						<div>
							<p class="text-sm font-semibold text-text-main">Asesor</p>
							<p class="mt-1 text-xs text-text-muted">{cita.idAsesor}</p>
						</div>
						<div>
							<p class="text-sm font-semibold text-text-main">{formatearFecha(cita.fechaInicio)}</p>
							<p class="mt-1 text-xs text-text-muted">
								{cita.observacion ?? 'Sin observación'}
							</p>
						</div>
						<p
							class="rounded-full px-3 py-1 text-center text-xs font-bold {estadoBadge(
								cita.estado
							)}"
						>
							{cita.estado}
						</p>
					</div>
				{/each}
			</div>
		</Card>
	{/if}
</div>
