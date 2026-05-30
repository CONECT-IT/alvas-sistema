<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { presentarEstadoContrato } from '$lib/shared/presentation';
	import { HttpError } from '$lib/shared/http/httpClient';
	import { firmarContrato } from '$lib/ventas/application/use-cases/firmarContrato';
	import { cancelarContrato } from '$lib/ventas/application/use-cases/cancelarContrato';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type ContratoDto = {
		id: string;
		idLead?: string;
		nombreLead?: string;
		idCliente?: string;
		idPropiedad: string;
		nombrePropiedad?: string;
		idAsesor?: string;
		nombreAsesor?: string;
		fechaInicio: string;
		fechaFin: string;
		estado: string;
		creadoEn: string;
		actualizadoEn: string;
	};

	let contrato = $state<ContratoDto | null>(data.contrato as ContratoDto | null);
	let loading = $state(!data.contrato);
	let error = $state<string | null>(null);
	let accionando = $state(false);
	let accionError = $state<string | null>(null);

	async function cargar() {
		if (!data.contrato?.id) return;
		loading = true;
		error = null;

		try {
			const res = await fetch(`/api/ventas/contratos/${data.contrato.id}`).then((r) =>
				r.json<{ success: boolean; data: ContratoDto }>()
			);
			contrato = res.success ? res.data : null;
			if (!res.success) error = 'Contrato no encontrado.';
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar el contrato.';
		} finally {
			loading = false;
		}
	}

	async function firmar() {
		if (!contrato) return;
		accionando = true;
		accionError = null;

		try {
			await firmarContrato(ventasRepository, (contrato as { id: string }).id);
			await cargar();
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'Error al firmar.';
		} finally {
			accionando = false;
		}
	}

	async function cancelar() {
		if (!contrato) return;
		accionando = true;
		accionError = null;

		try {
			await cancelarContrato(ventasRepository, (contrato as { id: string }).id);
			await cargar();
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'Error al cancelar.';
		} finally {
			accionando = false;
		}
	}

	function formatearFecha(fechaIso: string): string {
		return new Intl.DateTimeFormat('es-PE', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(fechaIso));
	}

	function puedeFirmar(): boolean {
		return (contrato as { estado: string })?.estado === 'BORRADOR';
	}

	function puedeCancelar(): boolean {
		const est = (contrato as { estado: string })?.estado;
		return est === 'BORRADOR' || est === 'VIGENTE';
	}
</script>

<svelte:head>
	<title>Contrato {data.idContrato} | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Contratos</p>
			<h1 class="page-heading">Detalle del contrato</h1>
		</div>

		<Button variant="ghost" onclick={() => goto('/admin/contratos')}>Volver a contratos</Button>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">{error}</p>
			<Button class="mt-5" onclick={cargar}>Intentar nuevamente</Button>
		</Card>
	{:else if contrato}
		{#if accionError}
			<p class="error-alert">{accionError}</p>
		{/if}

		<Card>
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">{contrato.id}</h2>
					<Badge tone={presentarEstadoContrato(contrato.estado).tone}>
						{presentarEstadoContrato(contrato.estado).label}
					</Badge>
				</div>

				<div class="flex gap-3">
					{#if puedeFirmar()}
						<Button disabled={accionando} onclick={firmar}>
							{accionando ? 'Firmando...' : 'Firmar contrato'}
						</Button>
					{/if}
					{#if puedeCancelar()}
						<Button variant="ghost" disabled={accionando} onclick={cancelar}>
							{accionando ? 'Cancelando...' : 'Cancelar contrato'}
						</Button>
					{/if}
				</div>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				<div>
					<p class="stat-label">Propiedad</p>
					<p class="mt-1 font-medium text-text-main">{contrato.idPropiedad}</p>
				</div>

				<div>
					<p class="stat-label">Lead origen</p>
					<p class="mt-1 font-medium text-text-main">{contrato.idLead ?? 'Sin lead asociado'}</p>
				</div>

				<div>
					<p class="stat-label">Cliente</p>
					<p class="mt-1 font-medium text-text-main">
						{contrato.idCliente ?? 'Por asignar en firma'}
					</p>
				</div>

				<div>
					<p class="stat-label">Inicio</p>
					<p class="mt-1 font-medium text-text-main">{formatearFecha(contrato.fechaInicio)}</p>
				</div>

				<div>
					<p class="stat-label">Fin</p>
					<p class="mt-1 font-medium text-text-main">{formatearFecha(contrato.fechaFin)}</p>
				</div>

				<div>
					<p class="stat-label">Creado</p>
					<p class="mt-1 font-medium text-text-main">{formatearFecha(contrato.creadoEn)}</p>
				</div>

				<div>
					<p class="stat-label">Actualizado</p>
					<p class="mt-1 font-medium text-text-main">{formatearFecha(contrato.actualizadoEn)}</p>
				</div>
			</div>
		</Card>
	{/if}
</div>
