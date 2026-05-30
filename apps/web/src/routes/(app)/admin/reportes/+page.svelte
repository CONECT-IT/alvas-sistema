<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import type {
		EstadisticasGlobales,
		ReporteGeneral
	} from '$lib/reportes/domain/models/ReporteGeneral';
	import ReporteResumen from '$lib/reportes/presentation/ReporteResumen.svelte';
	import ActividadReciente from '$lib/reportes/presentation/ActividadReciente.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let estadisticas = $derived(data?.estadisticas as unknown as EstadisticasGlobales);
	let reporte = $derived(data?.reporte as unknown as ReporteGeneral);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function cargarReportes() {
		loading = true;
		error = null;

		try {
			await invalidateAll();
		} catch {
			error = 'No se pudo actualizar los reportes.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Reportes Analíticos | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Reportes</p>
			<h1 class="page-heading">Resumen comercial</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Resumen de acciones comerciales: eventos recientes y actividad del sistema.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarReportes}>Actualizar reportes</Button>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar reportes</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarReportes}>Intentar nuevamente</Button>
		</Card>
	{:else if estadisticas && reporte}
		<ReporteResumen {estadisticas} {reporte} />
		<Card>
			<div class="mb-5">
				<h2 class="font-display text-xl font-bold text-text-main">Actividad reciente</h2>
				<p class="mt-1 text-sm text-text-muted">Eventos reportados por la API de reportes.</p>
			</div>
			<ActividadReciente {reporte} />
		</Card>
	{/if}
</div>
