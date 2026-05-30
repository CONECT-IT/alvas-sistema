<script lang="ts">
	import Card from '$lib/shared/ui/Card.svelte';
	import type { EstadisticasGlobales, ReporteGeneral } from '../domain/models/ReporteGeneral';

	interface Props {
		estadisticas: EstadisticasGlobales;
		reporte: ReporteGeneral;
	}

	let { estadisticas, reporte }: Props = $props();

	function labelEvento(evento: string): string {
		const labels: Record<string, string> = {
			LEAD_CREADO: 'Leads creados',
			CITA_AGENDADA: 'Citas agendadas',
			CITA_ACTUALIZADA: 'Citas actualizadas',
			CLIENTE_CONVERTIDO: 'Clientes convertidos',
			CONTRATO_FIRMADO: 'Contratos firmados',
			LEAD_ASIGNADO: 'Leads asignados',
			LEAD_ACTUALIZADO: 'Leads actualizados'
		};
		return labels[evento] ?? evento;
	}

	const topAcciones = $derived(
		reporte.resumenAcciones.acciones.toSorted((a, b) => b.total - a.total).slice(0, 4)
	);
</script>

<div class="grid gap-4 md:grid-cols-4">
	{#each topAcciones as accion (accion.evento)}
		<Card>
			<p class="text-sm font-medium text-text-muted">{labelEvento(accion.evento)}</p>
			<p class="mt-3 font-display text-3xl font-bold text-text-main">{accion.total}</p>
		</Card>
	{/each}
</div>

{#if estadisticas.acciones.length > 4}
	<div class="mt-4">
		<details class="cursor-pointer text-sm text-text-muted hover:text-text-main">
			<summary class="font-medium"
				>Ver todas las acciones ({estadisticas.totalAcciones} totales)</summary
			>
			<ul class="mt-2 space-y-1">
				{#each estadisticas.acciones as accion (accion.evento)}
					<li class="flex justify-between rounded-md bg-bg-card px-3 py-2 text-sm">
						<span>{labelEvento(accion.evento)}</span>
						<span class="font-semibold text-text-main">{accion.total}</span>
					</li>
				{/each}
			</ul>
		</details>
	</div>
{/if}
