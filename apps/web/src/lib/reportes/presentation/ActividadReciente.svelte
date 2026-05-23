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
			<button
				onclick={() => (window.location.href = `/admin/leads/${actividad.idLead}`)}
				class="rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase transition hover:bg-primary/20"
			>
				Ver prospecto
			</button>
		</div>
	{/each}
</div>
