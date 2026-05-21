<script lang="ts">
	import Card from '$lib/shared/ui/Card.svelte';
	import type { LeadPipeline } from '../domain/models/LeadPipeline';

	interface Props {
		leads: LeadPipeline[];
	}

	let { leads }: Props = $props();

	const conCitas = $derived(leads.filter((lead) => lead.citasCount > 0).length);
	const nuevos = $derived(
		leads.filter((lead) => lead.estado.toUpperCase().includes('NUEVO')).length
	);
	const estados = $derived(new Set(leads.map((lead) => lead.estado)).size);
</script>

<div class="grid gap-4 md:grid-cols-3">
	<Card>
		<p class="text-sm font-medium text-text-muted">Leads asignados</p>
		<p class="mt-3 font-display text-3xl font-bold text-text-main">{leads.length}</p>
		<p class="mt-1 text-xs text-text-muted">Prospectos visibles para la sesión actual.</p>
	</Card>
	<Card>
		<p class="text-sm font-medium text-text-muted">Con citas</p>
		<p class="mt-3 font-display text-3xl font-bold text-primary">{conCitas}</p>
		<p class="mt-1 text-xs text-text-muted">Prospectos con seguimiento programado.</p>
	</Card>
	<Card>
		<p class="text-sm font-medium text-text-muted">Nuevos</p>
		<p class="mt-3 font-display text-3xl font-bold text-text-main">{nuevos}</p>
		<p class="mt-1 text-xs text-text-muted">{estados} etapas presentes en la cartera.</p>
	</Card>
</div>
