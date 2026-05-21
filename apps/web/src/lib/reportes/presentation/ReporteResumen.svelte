<script lang="ts">
	import Card from '$lib/shared/ui/Card.svelte';
	import type { EstadisticasGlobales, ReporteGeneral } from '../domain/models/ReporteGeneral';

	interface Props {
		estadisticas: EstadisticasGlobales;
		reporte: ReporteGeneral;
	}

	let { estadisticas, reporte }: Props = $props();
</script>

<div class="grid gap-4 md:grid-cols-4">
	<Card>
		<p class="text-sm font-medium text-text-muted">Leads totales</p>
		<p class="mt-3 font-display text-3xl font-bold text-text-main">{estadisticas.totalLeads}</p>
	</Card>
	<Card>
		<p class="text-sm font-medium text-text-muted">Clientes</p>
		<p class="mt-3 font-display text-3xl font-bold text-primary">{estadisticas.totalClientes}</p>
	</Card>
	<Card>
		<p class="text-sm font-medium text-text-muted">Asesores activos</p>
		<p class="mt-3 font-display text-3xl font-bold text-text-main">
			{estadisticas.asesoresActivos}
		</p>
	</Card>
	<Card>
		<p class="text-sm font-medium text-text-muted">Conversión</p>
		<p class="mt-3 font-display text-3xl font-bold text-primary">
			{Math.round(reporte.metricas.conversionRate * 100)}%
		</p>
	</Card>
</div>
