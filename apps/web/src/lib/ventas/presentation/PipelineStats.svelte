<script lang="ts">
	import { presentarEstadoLead } from '$lib/shared/presentation';
	import type { LeadPipeline } from '../domain/models/LeadPipeline';

	type FiltroKey = 'todos' | 'conCitas' | 'nuevos' | 'compradores' | 'vendedores';

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
	const compradores = $derived(leads.filter((lead) => lead.tipo === 'COMPRA').length);
	const vendedores = $derived(leads.filter((lead) => lead.tipo === 'VENTA').length);
	const estados = $derived(new Set(leads.map((lead) => lead.estado)).size);

	const tarjetas = $derived([
		{
			key: 'todos' as FiltroKey,
			label: 'Leads totales',
			value: leads.length,
			desc: 'Prospectos totales en el sistema.',
			color: 'text-text-main'
		},
		{
			key: 'compradores' as FiltroKey,
			label: 'Compradores',
			value: compradores,
			desc: 'Leads con intención de compra.',
			color: 'text-primary'
		},
		{
			key: 'vendedores' as FiltroKey,
			label: 'Vendedores',
			value: vendedores,
			desc: 'Leads con intención de venta.',
			color: 'text-primary'
		},
		{
			key: 'conCitas' as FiltroKey,
			label: 'Seguimientos',
			value: conCitas,
			desc: 'Seguimientos pendientes y citas.',
			color: 'text-text-main'
		}
	]);
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
