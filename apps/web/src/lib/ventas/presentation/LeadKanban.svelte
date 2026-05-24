<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import type { LeadPipeline } from '../domain/models/LeadPipeline';
	import { actualizarLead } from '../application/use-cases/actualizarLead';
	import { ventasRepository } from '../infrastructure/ventasRepository';
	import { presentarEstadoLead, presentarTipoVenta } from '$lib/shared/presentation';

	interface Props {
		leads: LeadPipeline[];
		onLeadClick?: (lead: LeadPipeline) => void;
		onStatusChanged?: () => void;
	}

	let { leads, onLeadClick, onStatusChanged }: Props = $props();

	const columns = ['NUEVO', 'CONTACTO', 'AGENDADO', 'TRABAJANDO'];
	let draggingLeadId = $state<string | null>(null);
	let dragOverColumn = $state<string | null>(null);

	function getLeadsByColumn(column: string) {
		return leads.filter((l) => l.estado.toUpperCase() === column);
	}

	async function updateLeadStatus(idLead: string, nuevoEstado: string) {
		try {
			await actualizarLead(ventasRepository, {
				idLead,
				estado: nuevoEstado
			});
			onStatusChanged?.();
		} catch (error) {
			console.error('Error al cambiar estado:', error);
			alert('No se pudo cambiar el estado del lead.');
		}
	}

	function handleDragStart(leadId: string) {
		draggingLeadId = leadId;
	}

	function handleDragOver(e: DragEvent, column: string) {
		e.preventDefault();
		dragOverColumn = column;
	}

	function handleDragLeave() {
		dragOverColumn = null;
	}

	async function handleDrop(e: DragEvent, targetStatus: string) {
		e.preventDefault();
		dragOverColumn = null;
		if (!draggingLeadId) return;

		const lead = leads.find((l) => l.id === draggingLeadId);
		if (lead && lead.estado.toUpperCase() !== targetStatus) {
			await updateLeadStatus(draggingLeadId, targetStatus);
		}
		draggingLeadId = null;
	}

	let showStatusMenu = $state<string | null>(null);

	function toggleStatusMenu(leadId: string, e: MouseEvent) {
		e.stopPropagation();
		showStatusMenu = showStatusMenu === leadId ? null : leadId;
	}
</script>

<div class="no-scrollbar flex gap-4 overflow-x-auto pb-4">
	{#each columns as column (column)}
		<section
			class="flex max-w-[350px] min-w-[300px] flex-1 flex-col gap-4"
			ondragover={(e) => handleDragOver(e, column)}
			ondragleave={handleDragLeave}
			ondrop={(e) => handleDrop(e, column)}
			aria-label="Columna {column}"
		>
			<div class="flex items-center justify-between px-2">
				<h3 class="text-xs font-bold tracking-widest text-text-muted uppercase">{presentarEstadoLead(column).label}</h3>
				<span
					class="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-text-muted"
				>
					{getLeadsByColumn(column).length}
				</span>
			</div>

			<div
				class="flex min-h-[500px] flex-1 flex-col gap-3 rounded-2xl p-2 transition-all duration-200 {dragOverColumn ===
				column
					? 'bg-primary/10 ring-2 ring-primary/40 ring-inset'
					: draggingLeadId
						? 'bg-surface-muted/10'
						: 'bg-surface-muted/30'}"
			>
				{#each getLeadsByColumn(column) as lead (lead.id)}
					<article
						draggable="true"
						ondragstart={() => handleDragStart(lead.id)}
						ondragend={() => {
							draggingLeadId = null;
							dragOverColumn = null;
						}}
						class="group relative flex cursor-grab flex-col gap-3 rounded-2xl border border-border-light bg-bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:cursor-grabbing {draggingLeadId ===
						lead.id
							? 'scale-95 opacity-40 shadow-none grayscale-[0.5]'
							: ''}"
					>
						<button
							class="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100"
							onclick={(e) => toggleStatusMenu(lead.id, e)}
							aria-label="Cambiar estado"
						>
							<svg
								class="h-4 w-4 text-text-muted"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
								/>
							</svg>
						</button>

						{#if showStatusMenu === lead.id}
							<div
								class="absolute top-10 right-3 z-30 w-40 rounded-xl border border-border-light bg-bg-card p-1 shadow-xl"
								onclick={(e) => e.stopPropagation()}
								onkeydown={(e) => e.key === 'Escape' && (showStatusMenu = null)}
								role="menu"
								tabindex="0"
							>
								{#each columns as status (status)}
									<button
										class="w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition hover:bg-surface-muted {lead.estado.toUpperCase() ===
										status
											? 'text-primary'
											: 'text-text-main'}"
										onclick={() => {
											updateLeadStatus(lead.id, status);
											showStatusMenu = null;
										}}
									>
										{presentarEstadoLead(status).label}
									</button>
								{/each}
							</div>
							<div
								class="fixed inset-0 z-20"
								onclick={() => (showStatusMenu = null)}
								onkeydown={() => (showStatusMenu = null)}
								role="button"
								tabindex="-1"
								aria-label="Cerrar menú"
							></div>
						{/if}

						<button onclick={() => onLeadClick?.(lead)} class="w-full text-left">
							<div class="flex items-start justify-between gap-2">
								<p class="font-display text-sm font-bold text-text-main">{lead.nombre}</p>
								<Badge tone={presentarTipoVenta(lead.tipo).tone}>{presentarTipoVenta(lead.tipo).label}</Badge>
							</div>

							<div class="mt-3 flex flex-col gap-2">
								{#if lead.citasCount > 0}
									<div class="flex items-center gap-1.5 text-xs text-primary">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										<span class="font-semibold"
											>{lead.citasCount} cita{lead.citasCount > 1 ? 's' : ''}</span
										>
									</div>
								{/if}

								{#if lead.nombreAsesor}
									<p class="text-[10px] text-text-muted">
										Asesor: <span class="font-medium">{lead.nombreAsesor}</span>
									</p>
								{/if}
							</div>
						</button>
					</article>
				{/each}

				{#if getLeadsByColumn(column).length === 0}
					<div
						class="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-border-light p-8 text-center"
					>
						<p class="text-xs text-text-muted italic">Sin leads en esta etapa</p>
					</div>
				{/if}
			</div>
		</section>
	{/each}
</div>
