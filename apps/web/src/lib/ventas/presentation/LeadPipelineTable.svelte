<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import type { LeadPipeline } from '../domain/models/LeadPipeline';

	interface Props {
		leads: LeadPipeline[];
		onLeadClick?: (lead: LeadPipeline) => void;
		onEditClick?: (lead: LeadPipeline) => void;
	}

	let { leads, onLeadClick, onEditClick }: Props = $props();

	function getEstadoTone(estado: string): 'brand' | 'success' | 'neutral' {
		const normalized = estado.toUpperCase();
		if (normalized.includes('CONVERTIDO') || normalized.includes('CLIENTE')) return 'success';
		if (normalized.includes('NUEVO') || normalized.includes('CONTACTO')) return 'brand';
		return 'neutral';
	}
</script>

<div class="overflow-x-auto">
	<table class="w-full min-w-[720px] border-collapse text-left">
		<thead>
			<tr class="border-b border-border-light text-xs font-semibold text-text-muted uppercase">
				<th class="pb-3">Lead</th>
				<th class="pb-3">Tipo</th>
				<th class="pb-3">Estado</th>
				<th class="pb-3">Asesor</th>
				<th class="pb-3">Citas</th>
				<th class="w-20 pb-3">Acción</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border-light text-sm">
			{#each leads as lead (lead.id)}
				<tr
					class="cursor-pointer transition hover:bg-bg-base"
					onclick={() => onLeadClick?.(lead)}
					role={onLeadClick ? 'button' : undefined}
					tabindex={onLeadClick ? 0 : undefined}
					onkeydown={(e) => {
						if (e.key === 'Enter' && onLeadClick) onLeadClick(lead);
					}}
				>
					<td class="py-4 pr-6 font-semibold text-text-main">{lead.nombre}</td>
					<td class="py-4 pr-6 text-text-muted">{lead.tipo}</td>
					<td class="py-4 pr-6">
						<Badge tone={getEstadoTone(lead.estado)}>{lead.estado}</Badge>
					</td>
					<td class="py-4 pr-6 text-text-muted">{lead.nombreAsesor || lead.idAsesor || '-'}</td>
					<td class="py-4 text-text-muted">{lead.citasCount}</td>
					<td class="py-4 pl-3">
						{#if onEditClick}
							<button
								class="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
								onclick={(e) => {
									e.stopPropagation();
									onEditClick(lead);
								}}>Editar</button
							>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
