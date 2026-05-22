<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadDetalle } from '../domain/models/LeadDetalle';
	import { obtenerLead } from '../application/use-cases/obtenerLead';
	import { ventasRepository } from '../infrastructure/ventasRepository';
	import ActividadLeadTimeline from './ActividadLeadTimeline.svelte';

	interface Props {
		leadId: string;
	}

	let { leadId }: Props = $props();

	let lead = $state<LeadDetalle | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function cargar() {
		if (!leadId.trim()) {
			lead = null;
			loading = false;
			return;
		}
		loading = true;
		error = null;
		try {
			lead = await obtenerLead(ventasRepository, leadId.trim());
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar el lead.';
		} finally {
			loading = false;
		}
	}

	function badgeTone(estado: string): 'brand' | 'success' | 'neutral' {
		if (estado === 'NUEVO') return 'brand';
		if (estado === 'CONTACTO' || estado === 'VISITA_PROGRAMADA') return 'neutral';
		if (estado === 'NEGOCIACION' || estado === 'CONVERTIDO') return 'success';
		return 'neutral';
	}

	function badgeTipo(tipo: string): 'brand' | 'success' | 'neutral' {
		return tipo === 'COMPRA' ? 'brand' : 'success';
	}

	function formatearFecha(iso: string): string {
		return new Date(iso).toLocaleDateString('es-PE', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$effect(() => {
		cargar();
	});
</script>

{#if loading}
	<Card>
		<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
	</Card>
{:else if error}
	<Card class="text-center">
		<p class="font-display text-xl font-bold text-text-main">No se pudo cargar el lead</p>
		<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
		<Button onclick={cargar}>Intentar nuevamente</Button>
	</Card>
{:else if lead}
	<div class="flex flex-col gap-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="font-display text-3xl font-bold text-text-main">{lead.nombre}</h1>
					<Badge tone={badgeTone(lead.estado)}>{lead.estado}</Badge>
					<Badge tone={badgeTipo(lead.tipo)}>{lead.tipo}</Badge>
				</div>
				<p class="mt-2 text-sm text-text-muted">
					ID: {lead.id} &middot; Asesor: {lead.idAsesor}
					{#if lead.idCliente}
						&middot; Cliente vinculado: {lead.idCliente}
					{/if}
				</p>
			</div>
			<Button variant="secondary" onclick={() => window.history.back()}>Volver</Button>
		</div>

		<div class="grid gap-6 xl:grid-cols-2">
			<Card>
				<h2 class="mb-4 font-display text-xl font-bold text-text-main">Información de contacto</h2>
				<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
					<dt class="font-semibold text-text-muted">Email</dt>
					<dd class="text-text-main">{lead.email}</dd>
					<dt class="font-semibold text-text-muted">Teléfono</dt>
					<dd class="text-text-main">{lead.telefono}</dd>
					<dt class="font-semibold text-text-muted">Tipo</dt>
					<dd class="text-text-main">{lead.tipo}</dd>
					<dt class="font-semibold text-text-muted">Estado</dt>
					<dd class="text-text-main">{lead.estado}</dd>
					<dt class="font-semibold text-text-muted">Asesor asignado</dt>
					<dd class="text-text-main">{lead.idAsesor}</dd>
					{#if lead.idPropiedadInteres}
						<dt class="font-semibold text-text-muted">Propiedad de interés</dt>
						<dd class="text-text-main">{lead.idPropiedadInteres}</dd>
					{/if}
					{#if lead.idCliente}
						<dt class="font-semibold text-text-muted">Cliente vinculado</dt>
						<dd class="text-text-main">{lead.idCliente}</dd>
					{/if}
				</dl>
			</Card>

			<Card>
				<h2 class="mb-4 font-display text-xl font-bold text-text-main">Fechas</h2>
				<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
					<dt class="font-semibold text-text-muted">Creado</dt>
					<dd class="text-text-main">{formatearFecha(lead.creadoEn)}</dd>
					<dt class="font-semibold text-text-muted">Actualizado</dt>
					<dd class="text-text-main">{formatearFecha(lead.actualizadoEn)}</dd>
				</dl>
			</Card>
		</div>

		{#if lead.citas.length > 0}
			<Card>
				<h2 class="mb-4 font-display text-xl font-bold text-text-main">
					Citas ({lead.citas.length})
				</h2>
				<div class="space-y-3">
					{#each lead.citas as cita (cita.id)}
						<div class="rounded-xl border border-border-light p-4">
							<div class="flex items-start justify-between gap-4">
								<div>
									<p class="font-semibold text-text-main">
										{new Date(cita.fechaInicio).toLocaleDateString('es-PE', {
											day: '2-digit',
											month: 'long',
											year: 'numeric'
										})}
									</p>
									<p class="mt-1 text-sm text-text-muted">
										{new Date(cita.fechaInicio).toLocaleTimeString('es-PE', {
											hour: '2-digit',
											minute: '2-digit'
										})}
										&ndash;
										{new Date(cita.fechaFin).toLocaleTimeString('es-PE', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</p>
									{#if cita.observacion}
										<p class="mt-2 text-sm text-text-muted">{cita.observacion}</p>
									{/if}
								</div>
								<Badge
									tone={cita.estado === 'REALIZADA'
										? 'success'
										: cita.estado === 'CANCELADA'
											? 'neutral'
											: 'brand'}
								>
									{cita.estado}
								</Badge>
							</div>
							{#if cita.idPropiedad}
								<p class="mt-2 text-xs text-text-muted">Propiedad: {cita.idPropiedad}</p>
							{/if}
						</div>
					{/each}
				</div>
			</Card>
		{/if}

		<ActividadLeadTimeline leadId={lead.id} />
	</div>
{/if}
