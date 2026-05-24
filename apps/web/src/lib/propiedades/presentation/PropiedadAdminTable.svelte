<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import type { Propiedad } from '../domain/models/Propiedad';
	import { presentarEstadoPropiedad } from '$lib/shared/presentation';

	interface Props {
		propiedades: Propiedad[];
		onPropiedadClick?: (propiedad: Propiedad) => void;
	}

	let { propiedades, onPropiedadClick }: Props = $props();

	const currencyFormatter = new Intl.NumberFormat('es-PE', {
		style: 'currency',
		currency: 'PEN',
		maximumFractionDigits: 0
	});
</script>

<div class="overflow-x-auto">
	<table class="w-full min-w-[760px] border-collapse text-left">
		<thead>
			<tr class="border-b border-border-light text-xs font-semibold text-text-muted uppercase">
				<th class="pb-3">Propiedad</th>
				<th class="pb-3">Origen</th>
				<th class="pb-3">Precio</th>
				<th class="pb-3">Estado</th>
				<th class="pb-3">Asesor responsable</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border-light text-sm">
			{#each propiedades as propiedad (propiedad.id)}
				<tr
					class={onPropiedadClick ? 'cursor-pointer transition hover:bg-bg-base' : ''}
					onclick={() => onPropiedadClick?.(propiedad)}
					role={onPropiedadClick ? 'button' : undefined}
					tabindex={onPropiedadClick ? 0 : undefined}
					onkeydown={(e) => {
						if (e.key === 'Enter' && onPropiedadClick) onPropiedadClick(propiedad);
					}}
				>
					<td class="max-w-sm py-4 pr-6">
						<p class="font-semibold text-text-main">{propiedad.titulo}</p>
						<p class="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
							{propiedad.descripcion}
						</p>
					</td>
					<td class="py-4 pr-6 text-text-muted">{propiedad.origen}</td>
					<td class="py-4 pr-6 font-semibold text-primary">
						{currencyFormatter.format(propiedad.precio)}
					</td>
					<td class="py-4 pr-6">
						<Badge tone={presentarEstadoPropiedad(propiedad.estado).tone}>{presentarEstadoPropiedad(propiedad.estado).label}</Badge>
					</td>
					<td class="py-4 text-text-muted">
						{propiedad.asesorResponsableId ?? 'Sin asignar'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
