<script lang="ts">
	import { presentarEstadoLead } from '$lib/shared/presentation';
	import type { LeadPipeline } from '../domain/models/LeadPipeline';

	type FiltroKey = 'todos' | 'conCitas' | 'nuevos';

	interface Props {
		leads: LeadPipeline[];
		filtro?: FiltroKey;
		onFilter?: (key: FiltroKey) => void;
	}

	let { leads, filtro = 'todos', onFilter }: Props = $props();

	const conCitas = $derived(leads.filter((lead) => lead.citasCount > 0).length);
	const nuevos = $derived(
		leads.filter((lead) => presentarEstadoLead(lead.estado).tone === 'warning').length
	);
	const estados = $derived(new Set(leads.map((lead) => lead.estado)).size);

	const tarjetas = $derived([
		{
			key: 'todos' as FiltroKey,
			label: 'Leads asignados',
			value: leads.length,
			desc: 'Prospectos visibles para la sesión actual.',
			color: 'text-text-main'
		},
		{
			key: 'conCitas' as FiltroKey,
			label: 'Con citas',
			value: conCitas,
			desc: 'Prospectos con seguimiento programado.',
			color: 'text-primary'
		},
		{
			key: 'nuevos' as FiltroKey,
			label: 'Nuevos',
			value: nuevos,
			desc: `${estados} etapas presentes en la cartera.`,
			color: 'text-text-main'
		}
	]);
</script>

<div class="grid gap-4 md:grid-cols-3">
	{#each tarjetas as t (t.key)}
		<button
			type="button"
			onclick={() => onFilter?.(t.key)}
			class="group relative w-full rounded-3xl border bg-bg-card p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-panel active:scale-[0.98] {filtro ===
			t.key
				? 'border-primary/50 bg-primary-light/10 ring-2 ring-primary/25'
				: 'border-border-light'} {onFilter ? 'cursor-pointer' : 'cursor-default'}"
			aria-pressed={filtro === t.key}
		>
			<span
				class="absolute inset-0 rounded-3xl bg-primary/0 transition duration-300 group-active:bg-primary/10"
			></span>
			<span class="relative block text-sm font-medium text-text-muted">{t.label}</span>
			<span class="relative mt-3 block font-display text-3xl font-bold {t.color}">{t.value}</span>
			<span class="relative mt-1 block text-xs text-text-muted">{t.desc}</span>
		</button>
	{/each}
</div>
