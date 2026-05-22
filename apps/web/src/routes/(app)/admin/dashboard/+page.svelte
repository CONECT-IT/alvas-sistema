<script lang="ts">
	import { authStore } from '$lib/auth/infrastructure/authStore';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { estadisticas, propiedades, reporte } = data;

	const labels: Record<string, string> = {
		LEAD_REGISTRADO: 'Lead registrado',
		LEAD_ACTUALIZADO: 'Lead actualizado',
		CITA_AGENDADA: 'Cita agendada',
		CITA_ACTUALIZADA: 'Cita reprogramada',
		CONVERTIDO_A_CLIENTE: 'Lead convertido a cliente',
		LEAD_ASIGNADO_A_ASESOR: 'Lead reasignado'
	};

	const iconos: Record<string, string> = {
		LEAD_REGISTRADO: '●',
		LEAD_ACTUALIZADO: '✎',
		CITA_AGENDADA: '◷',
		CITA_ACTUALIZADA: '◷',
		CONVERTIDO_A_CLIENTE: '✓',
		LEAD_ASIGNADO_A_ASESOR: '→'
	};

	function tiempoRelativo(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'Ahora';
		if (mins < 60) return `Hace ${mins}m`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `Hace ${hrs}h`;
		const dias = Math.floor(hrs / 24);
		if (dias < 7) return `Hace ${dias}d`;
		return new Date(iso).toLocaleDateString('es-PE');
	}

	const propiedadesRecientes = propiedades.slice(0, 3);
	const totalPropiedades = propiedades.length;
	const disponibles = propiedades.filter((p) => p.estado === 'DISPONIBLE').length;
	const actividadReciente = reporte?.actividadReciente?.slice(0, 5) ?? [];
</script>

<svelte:head>
	<title>Panel de Administración | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-1">
		<h1 class="font-display text-3xl font-bold text-text-main">
			Bienvenido, {$authStore.user?.username}
		</h1>
		<p class="text-sm text-text-muted">
			Resumen del rendimiento inmobiliario general de ALVAS-Sistema.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase">Propiedades</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">{totalPropiedades}</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
				{disponibles} disponibles
			</div>
		</Card>

		<Card>
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Leads Totales</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">
				{estadisticas?.totalLeads ?? '—'}
			</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
				{reporte?.metricas.leadsNuevosHoy ?? 0} nuevos hoy
			</div>
		</Card>

		<Card>
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Tasa de Conversión</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">
				{reporte ? `${(reporte.metricas.conversionRate * 100).toFixed(1)}%` : '—'}
			</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
				{estadisticas?.totalClientes ?? 0} clientes
			</div>
		</Card>

		<Card>
			<span class="text-xs font-semibold tracking-wider text-text-muted uppercase"
				>Asesores Activos</span
			>
			<h2 class="mt-1 font-display text-3xl font-bold text-text-main">
				{estadisticas?.asesoresActivos ?? '—'}
			</h2>
			<div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-text-muted">
				<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
				En línea ahora
			</div>
		</Card>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<Card class="lg:col-span-2">
			<div class="mb-6 flex items-center justify-between">
				<h3 class="font-display text-lg font-bold text-text-main">
					Últimas Propiedades Registradas
				</h3>
				<a href="/admin/propiedades" class="text-sm font-semibold text-primary hover:underline">
					Ver todas
				</a>
			</div>

			{#if propiedadesRecientes.length === 0}
				<p class="py-6 text-center text-sm text-text-muted">No hay propiedades registradas.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-left">
						<thead>
							<tr class="border-b border-border-light text-xs font-semibold text-text-muted">
								<th class="pb-3">Título</th>
								<th class="pb-3">Precio</th>
								<th class="pb-3">Estado</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border-light text-sm">
							{#each propiedadesRecientes as p (p.id)}
								<tr>
									<td class="py-3.5 font-medium text-text-main">{p.titulo}</td>
									<td class="py-3.5 font-semibold text-primary">
										S/ {p.precio.toLocaleString('es-PE')}
									</td>
									<td class="py-3.5">
										<Badge tone={p.estado === 'DISPONIBLE' ? 'success' : 'neutral'}>
											{p.estado}
										</Badge>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</Card>

		<Card class="flex flex-col gap-6">
			<h3 class="font-display text-lg font-bold text-text-main">Actividad Reciente</h3>

			{#if actividadReciente.length === 0}
				<p class="text-sm text-text-muted">No hay actividad registrada aún.</p>
			{:else}
				<div class="flex flex-col gap-4">
					{#each actividadReciente as act (act.idLead + act.fecha)}
						<div
							class="flex items-center gap-3 border-b border-border-light pb-3 last:border-0 last:pb-0"
						>
							<div
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary"
							>
								{iconos[act.evento] ?? '•'}
							</div>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-semibold text-text-main">
									{labels[act.evento] ?? act.evento}
								</p>
								<p class="truncate text-xs text-text-muted">{act.descripcion}</p>
							</div>
							<span class="shrink-0 text-xs text-text-muted">{tiempoRelativo(act.fecha)}</span>
						</div>
					{/each}
				</div>
			{/if}

			<a
				href="/admin/ventas"
				class="w-full rounded-2xl bg-bg-base py-2.5 text-center text-sm font-semibold text-text-main transition hover:bg-primary hover:text-white"
			>
				Ir al CRM de Leads
			</a>
		</Card>
	</div>
</div>
