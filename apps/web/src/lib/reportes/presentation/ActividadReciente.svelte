<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import type { ReporteGeneral } from '../domain/models/ReporteGeneral';

	interface Props {
		reporte: ReporteGeneral;
	}

	let { reporte }: Props = $props();

	const eventos: Record<string, string> = {
		LEAD_CREADO: 'Lead registrado',
		LEAD_ACTUALIZADO: 'Lead actualizado',
		CITA_AGENDADA: 'Cita agendada',
		CITA_ACTUALIZADA: 'Cita actualizada',
		CLIENTE_CONVERTIDO: 'Cliente convertido',
		CONTRATO_CREADO: 'Contrato creado',
		CONTRATO_FIRMADO: 'Contrato firmado',
		LEAD_ASIGNADO: 'Lead asignado'
	};

	function presentarEvento(evento: string): string {
		return eventos[evento] ?? evento.replaceAll('_', ' ').toLowerCase();
	}

	function formatearFecha(fechaIso: string): string {
		return new Intl.DateTimeFormat('es-PE', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(fechaIso));
	}
</script>

<div class="flex flex-col divide-y divide-border-light">
	{#each reporte.actividadReciente as actividad, index (`${actividad.idLead}:${actividad.fecha}:${index}`)}
		<div class="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
			<div>
				<div class="flex items-center gap-2">
					<Badge tone="neutral">{presentarEvento(actividad.evento)}</Badge>
					<p class="text-xs text-text-muted">{formatearFecha(actividad.fecha)}</p>
				</div>
				<p class="mt-2 text-sm leading-relaxed text-text-main">{actividad.descripcion}</p>
			</div>
			<button
				onclick={() => goto(`/admin/leads/${encodeURIComponent(actividad.idLead)}`)}
				class="rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase transition hover:bg-primary/20"
			>
				Ver prospecto
			</button>
		</div>
	{/each}
</div>
