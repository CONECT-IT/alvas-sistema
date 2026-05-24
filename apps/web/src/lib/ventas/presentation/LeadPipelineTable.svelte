<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import type { LeadPipeline } from '../domain/models/LeadPipeline';
	import { actualizarLead } from '../application/use-cases/actualizarLead';
	import { ventasRepository } from '../infrastructure/ventasRepository';
	import { presentarEstadoLead, ESTADOS_LEAD } from '$lib/shared/presentation';

	interface Props {
		leads: LeadPipeline[];
		onLeadClick?: (lead: LeadPipeline) => void;
		onEditClick?: (lead: LeadPipeline) => void;
		onStatusChanged?: () => void;
	}

	let { leads, onLeadClick, onEditClick, onStatusChanged }: Props = $props();

	const estados = ESTADOS_LEAD;
	let activeMenuId = $state<string | null>(null);

	async function cambiarEstado(lead: LeadPipeline, nuevoEstado: string) {
		activeMenuId = null;
		if (lead.estado.toUpperCase() === nuevoEstado.toUpperCase()) return;

		try {
			await actualizarLead(ventasRepository, {
				idLead: lead.id,
				estado: nuevoEstado
			});
			onStatusChanged?.();
		} catch (error) {
			console.error('Error al actualizar estado:', error);
			alert('No se pudo actualizar el estado.');
		}
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
					class={onLeadClick ? 'cursor-pointer transition hover:bg-bg-base' : undefined}
					onclick={() => onLeadClick?.(lead)}
					role={onLeadClick ? 'button' : undefined}
					tabindex={onLeadClick ? 0 : undefined}
					onkeydown={(e) => {
						if (!onLeadClick) return;
						if (e.key === 'Enter' || e.key === ' ') onLeadClick(lead);
					}}
				>
					<td class="py-4 pr-6 font-semibold text-text-main">{lead.nombre}</td>
					<td class="py-4 pr-6 text-text-muted">{lead.tipo}</td>
					<td class="relative py-4 pr-6">
						<button
							class="group focus:outline-none"
							onclick={(e) => {
								e.stopPropagation();
								activeMenuId = activeMenuId === lead.id ? null : lead.id;
							}}
						>
							<Badge
								tone={presentarEstadoLead(lead.estado).tone}
								class="transition-all group-hover:ring-2 group-hover:ring-primary/20"
							>
								{presentarEstadoLead(lead.estado).label}
							</Badge>
						</button>

						{#if activeMenuId === lead.id}
							<div
								class="absolute top-12 left-0 z-50 w-40 rounded-xl border border-border-light bg-bg-card p-1 shadow-xl"
								onclick={(e) => e.stopPropagation()}
								role="menu"
							>
								{#each estados as estado (estado)}
									<button
										class="w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition hover:bg-surface-muted {lead.estado.toUpperCase() ===
										estado
											? 'text-primary'
											: 'text-text-main'}"
										onclick={() => cambiarEstado(lead, estado)}
									>
										{presentarEstadoLead(estado).label}
									</button>
								{/each}
							</div>
							<div
								class="fixed inset-0 z-40"
								onclick={() => (activeMenuId = null)}
								role="button"
								tabindex="-1"
								aria-label="Cerrar menú"
							></div>
						{/if}
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
