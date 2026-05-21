<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import type { ReporteGeneral } from '../domain/models/ReporteGeneral';

	interface Props {
		reporte: ReporteGeneral;
	}

	let { reporte }: Props = $props();
</script>

<div class="flex flex-col divide-y divide-border-light">
	{#each reporte.actividadReciente as actividad (actividad.idLead + actividad.fecha)}
		<div class="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
			<div>
				<div class="flex items-center gap-2">
					<Badge tone="neutral">{actividad.evento}</Badge>
					<p class="text-xs text-text-muted">{actividad.fecha}</p>
				</div>
				<p class="mt-2 text-sm leading-relaxed text-text-main">{actividad.descripcion}</p>
			</div>
			<p class="text-xs font-semibold text-primary">{actividad.idLead}</p>
		</div>
	{/each}
</div>
