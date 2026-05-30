<script lang="ts">
	import { authStore } from '$lib/auth/infrastructure/authStore';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { presentarEstadoCita } from '$lib/shared/presentation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let leadsActivos = $derived(data?.leadsActivos ?? 0);
	let citasPendientes = $derived(data?.citasPendientes ?? 0);
	let citasHoy = $derived(data?.citasHoy ?? []);
	let portafolio = $derived(data?.portafolio ?? 0);

	function formatearHora(iso: string): string {
		return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Panel de Asesor | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-1">
		<h1 class="font-display text-3xl font-bold text-text-main">
			Hola, {$authStore.user?.username}
		</h1>
		<p class="text-sm text-text-muted">
			Organiza tu agenda comercial y haz seguimiento a tus leads asignados.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<span class="stat-label">Mis Leads Activos</span>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">{leadsActivos}</h2>
			{#if leadsActivos > 0}
				<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
					<span>En tu cartera comercial</span>
				</div>
			{/if}
		</Card>

		<Card>
			<span class="stat-label">Citas Pendientes</span>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">{citasPendientes}</h2>
			{#if citasHoy.length > 0}
				<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
					<span>{citasHoy.length} para hoy</span>
				</div>
			{/if}
		</Card>

		<Card>
			<span class="stat-label">Citas Hoy</span>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">{citasHoy.length}</h2>
		</Card>

		<Card>
			<span class="stat-label">Propiedades en Cartera</span>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">{portafolio}</h2>
			{#if portafolio > 0}
				<div class="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
					<span>Disponibles y reservadas</span>
				</div>
			{/if}
		</Card>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<div class="rounded-3xl border border-border-light bg-bg-card p-6 shadow-xs lg:col-span-2">
			<div class="mb-6 flex items-center justify-between">
				<h3 class="font-display text-lg font-bold text-text-main">Agenda de Citas (Hoy)</h3>
				<a href="/asesor/citas" class="text-sm font-semibold text-primary hover:underline"
					>Ver calendario</a
				>
			</div>

			{#if citasHoy.length === 0}
				<p class="py-6 text-center text-sm text-text-muted">
					No tienes citas programadas para hoy.
				</p>
			{:else}
				<div class="flex flex-col gap-4">
					{#each citasHoy as cita (cita.id)}
						<div
							class="flex items-start gap-4 rounded-2xl border border-border-light bg-bg-base p-4"
						>
							<span
								class="shrink-0 rounded-xl bg-primary-light px-3 py-1.5 text-sm font-bold text-primary"
							>
								{formatearHora(cita.fechaInicio)}
							</span>
							<div class="min-w-0 flex-1">
								<h4 class="font-display text-sm font-bold text-text-main">
									{cita.observacion || `Cita con ${cita.leadNombre}`}
								</h4>
								<p class="mt-0.5 text-xs text-text-muted">
									Lead: {cita.leadNombre}
								</p>
							</div>
							<Badge tone={presentarEstadoCita(cita.estado).tone}>
								{presentarEstadoCita(cita.estado).label}
							</Badge>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div
			class="flex flex-col gap-6 rounded-3xl border border-border-light bg-bg-card p-6 shadow-xs"
		>
			<h3 class="font-display text-lg font-bold text-text-main">Acciones Rápidas</h3>

			<div class="flex flex-col gap-3">
				<a
					href="/asesor/leads"
					class="w-full rounded-2xl bg-primary py-3 text-center font-display text-sm font-semibold text-white shadow-xs transition hover:bg-primary-dark"
				>
					+ Registrar Nuevo Lead
				</a>
				<a
					href="/asesor/citas"
					class="w-full rounded-2xl border border-border-light bg-bg-card py-3 text-center font-display text-sm font-semibold text-text-main transition hover:bg-bg-base"
				>
					Crear Cita de Visita
				</a>
				<a
					href="/asesor/leads"
					class="w-full rounded-2xl bg-bg-base py-3 text-center font-display text-sm font-semibold text-text-main transition hover:bg-primary hover:text-white"
				>
					Ver Todos Mis Leads
				</a>
			</div>
		</div>
	</div>
</div>
