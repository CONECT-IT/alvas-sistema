<script lang="ts">
	import { HttpError } from '$lib/shared/http/httpClient';
	import { listarActividadLead } from '$lib/ventas/application/use-cases/listarActividadLead';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import type { ActividadLeadDTO } from '$lib/ventas/infrastructure/dto/VentasDTOs';

	let { leadId }: { leadId: string } = $props();

	const esqueletos = [1, 2, 3];
	let actividades = $state<ActividadLeadDTO[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const labels: Record<string, string> = {
		LEAD_REGISTRADO: 'Lead registrado',
		LEAD_ACTUALIZADO: 'Datos actualizados',
		CITA_AGENDADA: 'Cita agendada',
		CITA_ACTUALIZADA: 'Cita actualizada',
		CONVERTIDO_A_CLIENTE: 'Convertido a cliente',
		LEAD_ASIGNADO_A_ASESOR: 'Asignado a asesor'
	};

	const iconos: Record<string, string> = {
		LEAD_REGISTRADO: '●',
		LEAD_ACTUALIZADO: '✎',
		CITA_AGENDADA: '◷',
		CITA_ACTUALIZADA: '◷',
		CONVERTIDO_A_CLIENTE: '✓',
		LEAD_ASIGNADO_A_ASESOR: '→'
	};

	function formatearFecha(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('es-PE', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function cargar() {
		if (!leadId.trim()) {
			actividades = [];
			return;
		}

		loading = true;
		error = null;

		try {
			actividades = await listarActividadLead(ventasRepository, leadId.trim());
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar el historial.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (leadId) cargar();
	});
</script>

<div class="rounded-2xl border border-border-light bg-bg-card p-5">
	<h3 class="font-display text-lg font-bold text-text-main">Historial</h3>
	<p class="mt-1 text-sm text-text-muted">
		{actividades.length} evento{actividades.length === 1 ? '' : 's'} registrado{actividades.length ===
		1
			? ''
			: 's'}
	</p>

	{#if loading}
		<div class="mt-4 space-y-3">
			{#each esqueletos as _s (_s)}
				<div class="h-14 animate-pulse rounded-2xl bg-surface-muted"></div>
			{/each}
		</div>
	{:else if error}
		<p class="mt-4 text-sm text-red-700">{error}</p>
	{:else if actividades.length === 0}
		<p class="mt-4 text-sm text-text-muted">
			{leadId
				? 'Este lead no tiene actividad registrada aún.'
				: 'Selecciona un lead para ver su historial.'}
		</p>
	{:else}
		<div class="mt-4 space-y-0">
			{#each actividades as act, i (act.id)}
				<div class="flex gap-4">
					<div class="flex flex-col items-center">
						<span
							class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary"
						>
							{iconos[act.evento] ?? '•'}
						</span>
						{#if i < actividades.length - 1}
							<div class="mt-1 h-full w-px bg-border-light"></div>
						{/if}
					</div>
					<div class="pb-6">
						<p class="text-sm font-semibold text-text-main">
							{labels[act.evento] ?? act.evento}
						</p>
						<p class="text-xs text-text-muted">{act.descripcion}</p>
						<p class="mt-0.5 text-xs text-text-muted/60">{formatearFecha(act.fecha)}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
